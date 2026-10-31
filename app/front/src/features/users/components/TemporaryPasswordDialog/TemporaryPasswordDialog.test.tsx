import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { managedUserOf } from "@/test/fixtures/users";

import { TemporaryPasswordDialog } from "./TemporaryPasswordDialog";

const access = { user: managedUserOf(), temporaryPassword: "Temp1234" };

describe("TemporaryPasswordDialog", () => {
	it("shows the password and copies it", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.assign(navigator, { clipboard: { writeText } });
		render(<TemporaryPasswordDialog access={access} onClose={vi.fn()} />);

		expect(screen.getByText("Temp1234")).toBeInTheDocument();
		expect(screen.getByText(/não será exibida novamente/)).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Copiar Senha" }));

		await waitFor(() => expect(writeText).toHaveBeenCalledWith("Temp1234"));
	});

	it("closes only through Concluir", () => {
		const onClose = vi.fn();
		render(<TemporaryPasswordDialog access={access} onClose={onClose} />);

		fireEvent.keyDown(document.activeElement ?? document.body, {
			key: "Escape",
		});
		expect(onClose).not.toHaveBeenCalled();
		expect(
			screen.queryByRole("button", { name: /fechar|close/i }),
		).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Concluir" }));
		expect(onClose).toHaveBeenCalledOnce();
	});
});
