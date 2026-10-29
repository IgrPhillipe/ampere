import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RegisterPage } from "./RegisterPage";

const mockRegister = vi.fn();
vi.mock("@services/auth", () => ({
	useRegister: () => ({
		mutate: mockRegister,
		isPending: false,
	}),
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		className,
	}: {
		children: ReactNode;
		to: string;
		className?: string;
	}) => (
		<a href={to} className={className}>
			{children}
		</a>
	),
}));

describe("RegisterPage", () => {
	it("renderiza todos os campos e submete dados válidos de cadastro", async () => {
		render(<RegisterPage />);

		expect(
			screen.getByRole("heading", { name: "Criar conta" }),
		).toBeInTheDocument();
		expect(screen.getByText("ACESSO AO PORTAL")).toBeInTheDocument();

		fireEvent.change(screen.getByLabelText(/NOME COMPLETO/i), {
			target: { value: "Ana Carolina Lima" },
		});
		fireEvent.change(screen.getByLabelText(/NÚMERO DO CREA/i), {
			target: { value: "1684D" },
		});
		fireEvent.change(screen.getByLabelText(/UF DO CREA/i), {
			target: { value: "PE" },
		});
		fireEvent.change(screen.getByLabelText(/E-MAIL/i), {
			target: { value: "ana.lima@exemplo.com.br" },
		});
		fireEvent.change(screen.getByLabelText(/EMPRESA/i), {
			target: { value: "Lima Engenharia Elétrica" },
		});
		fireEvent.change(screen.getByLabelText(/TELEFONE/i), {
			target: { value: "81988214470" },
		});
		fireEvent.change(screen.getByLabelText(/^SENHA/i), {
			target: { value: "Senha@123" },
		});
		fireEvent.change(screen.getByLabelText(/CONFIRMAR SENHA/i), {
			target: { value: "Senha@123" },
		});

		fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

		await waitFor(() => {
			expect(mockRegister).toHaveBeenCalledWith(
				expect.objectContaining({
					name: "Ana Carolina Lima",
					crea: "1684D",
					creaState: "PE",
					email: "ana.lima@exemplo.com.br",
					company: "Lima Engenharia Elétrica",
					password: "Senha@123",
				}),
				expect.any(Object),
			);
		});
	});

	it("exibe mensagem de erro quando o e-mail já estiver cadastrado", async () => {
		mockRegister.mockImplementation((_payload, options) => {
			if (options?.onError) {
				options.onError({
					response: { status: 409 },
				});
			}
		});

		render(<RegisterPage />);

		fireEvent.change(screen.getByLabelText(/NOME COMPLETO/i), {
			target: { value: "Ana Carolina Lima" },
		});
		fireEvent.change(screen.getByLabelText(/NÚMERO DO CREA/i), {
			target: { value: "1684D" },
		});
		fireEvent.change(screen.getByLabelText(/UF DO CREA/i), {
			target: { value: "PE" },
		});
		fireEvent.change(screen.getByLabelText(/E-MAIL/i), {
			target: { value: "ana.lima@exemplo.com.br" },
		});
		fireEvent.change(screen.getByLabelText(/TELEFONE/i), {
			target: { value: "81988214470" },
		});
		fireEvent.change(screen.getByLabelText(/^SENHA/i), {
			target: { value: "Senha@123" },
		});
		fireEvent.change(screen.getByLabelText(/CONFIRMAR SENHA/i), {
			target: { value: "Senha@123" },
		});

		fireEvent.click(screen.getByRole("button", { name: "Criar conta" }));

		await waitFor(() => {
			expect(
				screen.getByText("Já existe uma conta com este e-mail."),
			).toBeInTheDocument();
		});
	});
});
