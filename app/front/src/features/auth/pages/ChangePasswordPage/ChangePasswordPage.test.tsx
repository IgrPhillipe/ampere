import { useAuthStore } from "@features/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";
import { signInAs } from "@/test/fixtures/project-detail";

import { ChangePasswordPage } from "./ChangePasswordPage";

const mockChangePassword = vi.fn();
const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock("@services/users", () => ({
	useChangePassword: () => ({ mutate: mockChangePassword, isPending: false }),
}));

vi.mock("@services/auth", () => ({
	useLogout: () => mockLogout,
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => mockNavigate,
}));

const fill = (label: RegExp, value: string) =>
	fireEvent.change(screen.getByLabelText(label), { target: { value } });

const submitPasswords = () => {
	fill(/senha temporária/i, "Tmp12345");
	fill(/^nova senha/i, "Nova12345");
	fill(/confirmar nova senha/i, "Nova12345");
	fireEvent.click(screen.getByRole("button", { name: "Salvar Nova Senha" }));
};

describe("ChangePasswordPage", () => {
	beforeEach(() => {
		mockChangePassword.mockReset();
		mockNavigate.mockReset();
		mockLogout.mockReset();
		signInAs("reviewer", { mustChangePassword: true });
	});

	afterEach(() => useAuthStore.getState().logout());

	it("troca a senha temporária e segue para a rota de origem", async () => {
		mockChangePassword.mockImplementation((_payload, options) =>
			options.onSuccess(),
		);

		render(<ChangePasswordPage redirectTo="/tabelas-normativas" />);
		submitPasswords();

		await waitFor(() =>
			expect(mockNavigate).toHaveBeenCalledWith({ to: "/tabelas-normativas" }),
		);
		expect(mockChangePassword.mock.lastCall?.[0]).toEqual({
			currentPassword: "Tmp12345",
			newPassword: "Nova12345",
		});
		expect(useAuthStore.getState().user?.mustChangePassword).toBe(false);
	});

	it("sem rota de origem, abre a página inicial do papel", async () => {
		mockChangePassword.mockImplementation((_payload, options) =>
			options.onSuccess(),
		);

		render(<ChangePasswordPage />);
		submitPasswords();

		await waitFor(() =>
			expect(mockNavigate).toHaveBeenCalledWith({ to: "/fila-de-analise" }),
		);
	});

	it("mostra no campo que a senha temporária está incorreta", async () => {
		const wrongPassword = await httpErrorOf(422, {
			detail: "A senha atual está incorreta.",
		});
		mockChangePassword.mockImplementation((_payload, options) =>
			options.onError(wrongPassword),
		);

		render(<ChangePasswordPage />);
		submitPasswords();

		expect(
			await screen.findByText("A senha atual está incorreta."),
		).toBeInTheDocument();
		expect(mockNavigate).not.toHaveBeenCalled();
		expect(useAuthStore.getState().user?.mustChangePassword).toBe(true);
	});

	it("sai da conta sem trocar a senha", () => {
		render(<ChangePasswordPage />);

		fireEvent.click(screen.getByRole("button", { name: "Sair" }));

		expect(mockLogout).toHaveBeenCalledOnce();
		expect(mockChangePassword).not.toHaveBeenCalled();
	});
});
