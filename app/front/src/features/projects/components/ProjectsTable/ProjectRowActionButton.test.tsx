import type { Project } from "@services/projects";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectRowActionButton } from "./ProjectRowActionButton";
import type { ProjectRowActions } from "./project-row";

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
	consumerUnitsCount: 0,
	demandKva: null,
};

const actions = (): ProjectRowActions => ({
	onViewFindings: vi.fn(),
	onResumeSubmission: vi.fn(),
	onContinueDraft: vi.fn(),
	onViewProject: vi.fn(),
	onDeleteProject: vi.fn(),
});

describe("ProjectRowActionButton", () => {
	it("offers deletion for a draft", () => {
		const callbacks = actions();
		render(<ProjectRowActionButton project={project} {...callbacks} />);

		fireEvent.click(
			screen.getByRole("button", { name: `Ações do projeto ${project.name}` }),
		);
		fireEvent.click(screen.getByRole("menuitem", { name: "Excluir Projeto" }));

		expect(callbacks.onDeleteProject).toHaveBeenCalledWith(project);
	});

	it.each([
		0, 1, 3,
	])("opens the findings of a rejected project with %i pending", (pendingCount) => {
		const callbacks = actions();
		const rejected = { ...project, status: "REJECTED" as const, pendingCount };
		render(<ProjectRowActionButton project={rejected} {...callbacks} />);

		fireEvent.click(screen.getByRole("button", { name: "Corrigir" }));

		expect(callbacks.onViewFindings).toHaveBeenCalledWith(rejected);
	});

	it.each([
		"AWAITING_SUBMISSION",
		"UNDER_REVIEW",
		"REJECTED",
		"APPROVED",
	] as const)("does not offer deletion for %s", (status) => {
		render(
			<ProjectRowActionButton
				project={{ ...project, status }}
				{...actions()}
			/>,
		);

		expect(
			screen.queryByRole("button", { name: /ações do projeto/i }),
		).not.toBeInTheDocument();
	});
});
