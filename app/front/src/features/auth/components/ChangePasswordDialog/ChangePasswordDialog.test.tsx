import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { httpErrorOf } from "@/test/fixtures/http-error";

import { ChangePasswordDialog } from "./ChangePasswordDialog";

const mockChangePassword = vi.fn();

vi.mock("@services/users", () => ({
	useChangePassword: () => ({ mutate: mockChangePassword, isPending: false }),
}));

const Harness = () => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<button type="button" onClick={() => setOpen(true)}>
				Abrir
			</button>
			<ChangePasswordDialog open={open} onOpenChange={setOpen} />
		</>
	);
};

const fill = (label: RegExp, value: string) =>
	fireEvent.change(screen.getByLabelText(label), { target: { value } });

const fillPasswords = () => {
	fill(/senha atual/i, "errada123");
	fill(/^nova senha/i, "Nova12345");
	fill(/confirmar nova senha/i, "Nova12345");
};

const open = () =>
	fireEvent.click(screen.getByRole("button", { name: "Abrir" }));

describe("ChangePasswordDialog", () => {
	beforeEach(() => {
		mockChangePassword.mockReset();
	});

	it("mostra no campo que a senha atual está incorreta", async () => {
		const wrongPassword = await httpErrorOf(422, {
			detail: "A senha atual está incorreta.",
		});
		mockChangePassword.mockImplementation((_payload, options) =>
			options.onError(wrongPassword),
		);

		render(<Harness />);
		open();
		fillPasswords();
		fireEvent.click(screen.getByRole("button", { name: "Alterar Senha" }));

		expect(
			await screen.findByText("A senha atual está incorreta."),
		).toBeInTheDocument();
		expect(mockChangePassword.mock.lastCall?.[0]).toEqual({
			currentPassword: "errada123",
			newPassword: "Nova12345",
		});
	});

	it("limpa as senhas ao cancelar", async () => {
		render(<Harness />);
		open();
		fillPasswords();
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);

		open();

		expect(await screen.findByLabelText(/senha atual/i)).toHaveValue("");
		expect(screen.getByLabelText(/^nova senha/i)).toHaveValue("");
	});
});
