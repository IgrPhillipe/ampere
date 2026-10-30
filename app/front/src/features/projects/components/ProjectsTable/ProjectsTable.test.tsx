import type { Project } from "@services/projects";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectsTable } from "./ProjectsTable";

const project: Project = {
	id: "4",
	name: "Residencial Monte Verde",
	address: "Rodovia BR-104, km 8",
	municipality: "Caruaru",
	state: "PE",
	protocol: "2026-0441",
	ownerId: "1",
	ownerName: "Beto Projetista",
	status: "UNDER_REVIEW",
	createdAt: "2026-09-09T08:00:00Z",
	updatedAt: "2026-09-18T09:40:00Z",
	pendingCount: 0,
	consumerUnitsCount: 0,
	demandKva: null,
};

const actions = {
	onViewFindings: vi.fn(),
	onResumeSubmission: vi.fn(),
	onContinueDraft: vi.fn(),
	onViewProject: vi.fn(),
	onEditProject: vi.fn(),
	onDeleteProject: vi.fn(),
};

describe("ProjectsTable", () => {
	it("shows who designed each project when asked", () => {
		render(<ProjectsTable projects={[project]} showOwner {...actions} />);

		expect(
			screen.getByRole("columnheader", { name: "Projetista" }),
		).toBeInTheDocument();
		expect(screen.getAllByText("Beto Projetista")).toHaveLength(1);
	});

	it("leaves the designer column out by default", () => {
		render(<ProjectsTable projects={[project]} {...actions} />);

		expect(
			screen.queryByRole("columnheader", { name: "Projetista" }),
		).not.toBeInTheDocument();
		expect(screen.queryByText("Beto Projetista")).not.toBeInTheDocument();
	});

	it("tells a list with no projects apart from a filter with no match", () => {
		const { rerender } = render(<ProjectsTable projects={[]} {...actions} />);

		expect(screen.getByText("Nenhum projeto cadastrado")).toBeInTheDocument();

		rerender(
			<ProjectsTable projects={[]} onClearFilters={vi.fn()} {...actions} />,
		);

		expect(
			screen.getByText(
				"Nenhum projeto encontrado para os critérios informados",
			),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Limpar Filtros" }),
		).toBeInTheDocument();
	});
});
