import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./ConfirmDialog";

const renderDialog = (isPending: boolean) => {
	const onOpenChange = vi.fn();
	const onConfirm = vi.fn();
	render(
		<ConfirmDialog
			open
			title="Excluir grupo?"
			description="O grupo Área comum será removido do projeto."
			confirmLabel="Excluir Grupo"
			pendingLabel="Excluindo..."
			isPending={isPending}
			destructive
			onOpenChange={onOpenChange}
			onConfirm={onConfirm}
		/>,
	);

	return { onOpenChange, onConfirm };
};

describe("ConfirmDialog", () => {
	it("cancels without confirming and confirms only from the action", () => {
		const { onOpenChange, onConfirm } = renderDialog(false);

		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(onConfirm).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "Excluir Grupo" }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it("locks both actions while the request runs", () => {
		renderDialog(true);

		expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
	});
});
