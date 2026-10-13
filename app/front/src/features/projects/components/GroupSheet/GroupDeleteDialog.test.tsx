import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GroupDeleteDialog } from "./GroupDeleteDialog";

describe("GroupDeleteDialog", () => {
	it("identifies the group and waits for confirmation", () => {
		const onOpenChange = vi.fn();
		const onConfirm = vi.fn();
		render(
			<GroupDeleteDialog
				groupName="Apartamento tipo A"
				open
				isPending={false}
				onOpenChange={onOpenChange}
				onConfirm={onConfirm}
			/>,
		);

		expect(screen.getByText("Apartamento tipo A")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(onConfirm).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "Excluir Grupo" }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});
});
