import type { Project } from "@services/projects";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectDeleteDialog } from "./ProjectDeleteDialog";

const project: Project = {
	id: "4",
	name: "Residencial Monte Verde",
	address: "Rodovia BR-104, km 8",
	municipality: "Caruaru",
	protocol: "2026-0441",
	ownerId: "1",
	ownerName: "Usuário Teste",
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
				/grupos de unidades consumidoras, cálculos, documentos e apontamentos/i,
			),
		).toBeInTheDocument();
	});
});
