import type { ProfileResponse } from "@services/users";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { ProfilePage } from "./ProfilePage";

const profile: ProfileResponse = {
	id: "1",
	name: "Ana Lima",
	email: "ana@exemplo.com",
	role: "user",
	crea: "1684D",
	creaState: "PE",
	company: null,
	phone: "81988214470",
};

const mockUpdate = vi.fn();
const mockRefetch = vi.fn();
const profileQuery = vi.fn();

vi.mock("@services/users", () => ({
	useGetProfile: () => profileQuery(),
	useUpdateProfile: () => ({ mutate: mockUpdate, isPending: false }),
	useChangePassword: () => ({ mutate: vi.fn(), isPending: false }),
}));

const loaded = () =>
	profileQuery.mockReturnValue({
		data: { data: profile },
		isLoading: false,
		isError: false,
		refetch: mockRefetch,
	});

const responsibleText = () =>
	screen.getByText("Responsável técnico no carimbo e no memorial")
		.nextElementSibling;

describe("ProfilePage", () => {
	beforeEach(() => {
		mockUpdate.mockReset();
		signInAs("user");
		loaded();
	});

	it("preenche o formulário e a prévia do responsável técnico", async () => {
		render(<ProfilePage />);

		expect(await screen.findByDisplayValue("Ana Lima")).toBeInTheDocument();
		expect(screen.getByLabelText(/telefone/i)).toHaveValue("(81) 98821-4470");
		expect(responsibleText()).toHaveTextContent("Ana Lima, CREA 1684D/PE");
	});

	it("atualiza a prévia com o que está no formulário", async () => {
		render(<ProfilePage />);
		await screen.findByDisplayValue("Ana Lima");

		fireEvent.change(screen.getByLabelText(/número do crea/i), {
			target: { value: "" },
		});

		expect(responsibleText()).toHaveTextContent("Ana Lima, sem CREA");
	});

	it("envia só o que a API edita", async () => {
		render(<ProfilePage />);
		await screen.findByDisplayValue("Ana Lima");

		fireEvent.change(screen.getByLabelText(/empresa/i), {
			target: { value: "Lima Engenharia" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }));

		await waitFor(() => expect(mockUpdate).toHaveBeenCalledOnce());
		expect(mockUpdate.mock.lastCall?.[0]).toEqual({
			name: "Ana Lima",
			company: "Lima Engenharia",
			phone: "(81) 98821-4470",
			crea: "1684D",
			creaState: "PE",
		});
	});

	it.each([
		"admin",
		"reviewer",
	] as const)("deixa %s salvar sem CREA e sem o registro profissional", async (role) => {
		signInAs(role);
		profileQuery.mockReturnValue({
			data: { data: { ...profile, role, crea: null, creaState: null } },
			isLoading: false,
			isError: false,
			refetch: mockRefetch,
		});

		render(<ProfilePage />);
		await screen.findByDisplayValue("Ana Lima");

		expect(screen.queryByText("Registro Profissional")).not.toBeInTheDocument();
		expect(
			screen.queryByText("Responsável técnico no carimbo e no memorial"),
		).not.toBeInTheDocument();

		fireEvent.change(screen.getByLabelText(/nome completo/i), {
			target: { value: "Ana Souza" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Salvar Alterações" }));

		await waitFor(() => expect(mockUpdate).toHaveBeenCalledOnce());
		expect(mockUpdate.mock.lastCall?.[0]).toEqual({
			name: "Ana Souza",
			company: null,
			phone: "(81) 98821-4470",
			crea: "",
			creaState: "",
		});
	});

	it("oferece tentar de novo quando o perfil não carrega", () => {
		profileQuery.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			refetch: mockRefetch,
		});

		render(<ProfilePage />);
		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));

		expect(mockRefetch).toHaveBeenCalled();
	});
});
