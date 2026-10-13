import type { Project } from "@services/projects";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectDeleteDialog } from "./ProjectDeleteDialog";

const project: Project = {
	id: "4",
	name: "Residencial Monte Verde",
	address: "Rodovia BR-104, km 8",
	municipality: "Caruaru",
	protocol: "2026-0441",
	status: "DRAFT",
	createdAt: "2026-09-09T08:00:00Z",
	updatedAt: "2026-09-18T09:40:00Z",
	pendingCount: 0,
	consumerUnitsCount: 3,
	demandKva: null,
};

describe("ProjectDeleteDialog", () => {
	it("identifies the draft and warns about associated data", () => {
		render(
			<ProjectDeleteDialog
				project={project}
				isPending={false}
				onOpenChange={vi.fn()}
				onConfirm={vi.fn()}
			/>,
		);

		expect(screen.getByText(project.name)).toBeInTheDocument();
		expect(screen.getByText(project.protocol)).toBeInTheDocument();
		expect(
			screen.getByText(
				/grupos de unidades consumidoras, cálculos e documentos/i,
			),
		).toBeInTheDocument();
	});

	it("cancels without confirming and confirms only from the destructive action", () => {
		const onOpenChange = vi.fn();
		const onConfirm = vi.fn();
		render(
			<ProjectDeleteDialog
				project={project}
				isPending={false}
				onOpenChange={onOpenChange}
				onConfirm={onConfirm}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(onConfirm).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "Excluir Projeto" }));
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it("locks the dialog while deletion is pending", () => {
		render(
			<ProjectDeleteDialog
				project={project}
				isPending
				onOpenChange={vi.fn()}
				onConfirm={vi.fn()}
			/>,
		);

		expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
	});
});
