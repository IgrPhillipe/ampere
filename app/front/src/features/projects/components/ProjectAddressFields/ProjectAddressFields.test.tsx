import { useZodForm } from "@features/shared";
import {
	getPostalCodeAddress,
	getStateList,
	getStateMunicipalityList,
} from "@services/locations/requests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useWatch } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { projectCreationSchema } from "../../schemas";
import { ProjectAddressFields } from "./ProjectAddressFields";

vi.mock("@services/locations/requests", () => ({
	getStateList: vi.fn(),
	getStateMunicipalityList: vi.fn(),
	getPostalCodeAddress: vi.fn(),
}));

const Form = () => {
	const form = useZodForm(projectCreationSchema, {
		postalCode: "",
		municipality: "",
		address: "",
	});
	const [state, municipality, address] = useWatch({
		control: form.control,
		name: ["state", "municipality", "address"],
	});

	return (
		<>
			<ProjectAddressFields form={form} />
			<output>{[state, municipality, address].join(" | ")}</output>
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

describe("ProjectAddressFields", () => {
	beforeEach(() => {
		vi.mocked(getStateList).mockResolvedValue([
			{ sigla: "PE", nome: "Pernambuco" },
		]);
		vi.mocked(getStateMunicipalityList).mockResolvedValue(["Recife"]);
	});

	it("fills the state, the municipality and the street from the CEP", async () => {
		vi.mocked(getPostalCodeAddress).mockResolvedValue({
			cep: "50030-230",
			logradouro: "Cais do Apolo",
			bairro: "Recife",
			localidade: "Recife",
			uf: "PE",
		});
		renderForm();

		fireEvent.change(screen.getByLabelText(/CEP/), {
			target: { value: "50030-230" },
		});

		await waitFor(() =>
			expect(screen.getByRole("status")).toHaveTextContent(
				"PE | Recife | Cais do Apolo, Recife",
			),
		);
		expect(getPostalCodeAddress).toHaveBeenCalledWith("50030230");
	});

	it("refuses a CEP outside the concession area", async () => {
		vi.mocked(getPostalCodeAddress).mockResolvedValue({
			cep: "01310-100",
			logradouro: "Avenida Paulista",
			bairro: "Bela Vista",
			localidade: "São Paulo",
			uf: "SP",
		});
		renderForm();

		fireEvent.change(screen.getByLabelText(/CEP/), {
			target: { value: "01310100" },
		});

		expect(
			await screen.findByText(
				"Fora da área atendida pela Neoenergia Pernambuco: Pernambuco ou Pedras de Fogo (PB).",
			),
		).toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveTextContent(/^\s*\|\s*\|\s*$/);
	});

	it("asks for the state and the municipality when the CEP is unknown", async () => {
		vi.mocked(getPostalCodeAddress).mockResolvedValue(null);
		renderForm();

		fireEvent.change(screen.getByLabelText(/CEP/), {
			target: { value: "00000000" },
		});

		expect(
			await screen.findByText(
				"CEP não encontrado. Escolha a UF e o município.",
			),
		).toBeInTheDocument();
	});
});
