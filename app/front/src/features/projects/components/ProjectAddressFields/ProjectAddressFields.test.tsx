import { useZodForm } from "@features/shared";
import { getPostalCodeAddress } from "@services/locations/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useWatch } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { projectCreationSchema } from "../../schemas";
import { ProjectAddressFields } from "./ProjectAddressFields";

vi.mock("@services/locations/requests", () => ({
	getPostalCodeAddress: vi.fn(),
}));

const Form = () => {
	const form = useZodForm(projectCreationSchema, {
		postalCode: "",
		municipality: "Recife",
		address: "Rua Antiga, 1",
	});
	const [postalCode, state, municipality, address] = useWatch({
		control: form.control,
		name: ["postalCode", "state", "municipality", "address"],
	});

	return (
		<>
			<ProjectAddressFields form={form} />
			<output>{[postalCode, state, municipality, address].join(" | ")}</output>
		</>
	);
};

const renderForm = () =>
	render(
		<QueryClientProvider
			client={
				new QueryClient({ defaultOptions: { queries: { retry: false } } })
			}
		>
			<Form />
		</QueryClientProvider>,
	);

const typePostalCode = (value: string) =>
	fireEvent.change(screen.getByLabelText(/CEP/), { target: { value } });

describe("ProjectAddressFields", () => {
	it("masks the CEP and fills the rest with the IBGE spelling", async () => {
		vi.mocked(getPostalCodeAddress).mockResolvedValue({
			cep: "55840-000",
			logradouro: "Rua do Rosário",
			bairro: "Centro",
			localidade: "Lagoa do Itaenga",
			uf: "PE",
			ibge: "2608503",
		});
		renderForm();

		typePostalCode("55840000");

		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent(
				"55840-000 | PE | Lagoa de Itaenga | Rua do Rosário, Centro",
			),
		);
		expect(getPostalCodeAddress).toHaveBeenCalledWith("55840000");
	});

	it("clears the address and refuses a CEP outside the area", async () => {
		vi.mocked(getPostalCodeAddress).mockResolvedValue({
			cep: "01310-100",
			logradouro: "Avenida Paulista",
			bairro: "Bela Vista",
			localidade: "São Paulo",
			uf: "SP",
			ibge: "3550308",
		});
		renderForm();

		typePostalCode("01310100");

		expect(
			await screen.findByText(
				"Fora da área atendida pela Neoenergia Pernambuco: Pernambuco ou Pedras de Fogo (PB).",
			),
		).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveTextContent(
			/^01310-100 \|\s*\|\s*\|\s*$/,
		);
	});

	it("asks for the state and the municipality when the CEP is unknown", async () => {
		vi.mocked(getPostalCodeAddress).mockResolvedValue(null);
		renderForm();

		typePostalCode("50999999");

		expect(
			await screen.findByText(
				"CEP não encontrado. Escolha a UF e o município.",
			),
		).toBeInTheDocument();
	});

	it("tells when ViaCEP cannot be reached", async () => {
		vi.mocked(getPostalCodeAddress).mockRejectedValue(new Error("timeout"));
		renderForm();

		typePostalCode("50030230");

		expect(
			await screen.findByText(
				"Não foi possível buscar o CEP. Escolha a UF e o município.",
			),
		).toBeInTheDocument();
	});
});
