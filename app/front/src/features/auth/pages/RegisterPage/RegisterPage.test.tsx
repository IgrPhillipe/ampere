import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { RegisterPage } from "./RegisterPage";

const mockRegister = vi.fn();

vi.mock("@services/auth", () => ({
	useRegister: () => ({ mutate: mockRegister, isPending: false }),
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children, to }: { children: ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
}));

const fill = (label: RegExp, value: string) =>
	fireEvent.change(screen.getByLabelText(label), { target: { value } });

const fillValidForm = () => {
	fill(/nome completo/i, "Ana Carolina Lima");
	fill(/número do crea/i, "1684D");
	fill(/uf do crea/i, "pe");
	fill(/e-mail/i, "ana.lima@exemplo.com.br");
	fill(/telefone/i, "81988214470");
	fill(/^senha/i, "Senha123");
	fill(/confirmar senha/i, "Senha123");
};

const submit = () =>
	fireEvent.click(screen.getByRole("button", { name: "Criar Conta" }));

describe("RegisterPage", () => {
	beforeEach(() => {
		mockRegister.mockReset();
	});

	it("envia o cadastro no formato da API", async () => {
		render(<RegisterPage />);

		fillValidForm();
		submit();

		await waitFor(() => expect(mockRegister).toHaveBeenCalledOnce());
		expect(mockRegister.mock.lastCall?.[0]).toEqual({
			name: "Ana Carolina Lima",
			email: "ana.lima@exemplo.com.br",
			password: "Senha123",
			crea: "1684D",
			creaState: "PE",
			company: undefined,
			phone: "(81) 98821-4470",
		});
	});

	it("não envia o CREA com hífen, que a API recusa", async () => {
		render(<RegisterPage />);

		fillValidForm();
		fill(/número do crea/i, "1684-D");
		submit();

		expect(
			await screen.findByText(
				"Informe só o número do CREA, sem a UF e sem hífen.",
			),
		).toBeInTheDocument();
		expect(mockRegister).not.toHaveBeenCalled();
	});

	it("mostra no campo de e-mail que a conta já existe", async () => {
		const conflict = await httpErrorOf(409, {
			detail: "Já existe uma conta com este e-mail.",
		});
		mockRegister.mockImplementation((_payload, options) =>
			options.onError(conflict),
		);

		render(<RegisterPage />);

		fillValidForm();
		submit();

		expect(
			await screen.findByText("Já existe uma conta com este e-mail."),
		).toBeInTheDocument();
		expect(screen.getByLabelText(/e-mail/i)).toHaveAttribute(
			"aria-invalid",
			"true",
		);
	});
});
