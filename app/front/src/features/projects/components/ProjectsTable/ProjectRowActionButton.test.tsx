import { type UserRole, useAuthStore } from "@features/shared";
import type { Project } from "@services/projects";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectRowActionButton } from "./ProjectRowActionButton";
import type { ProjectRowActions } from "./project-row";

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
	consumerUnitsCount: 0,
	demandKva: null,
};

const actions = (): ProjectRowActions => ({
	onResumeSubmission: vi.fn(),
	onContinueDraft: vi.fn(),
	onViewProject: vi.fn(),
	onEditProject: vi.fn(),
	onDeleteProject: vi.fn(),
});

const signInAs = (role: UserRole, id = "1") =>
	useAuthStore.getState().login({
		id,
		name: "Teste",
		email: "teste@ampere.com",
		role,
		mustChangePassword: false,
		token: "token",
	});

describe("ProjectRowActionButton", () => {
	beforeEach(() => signInAs("user"));

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
	])("opens the detail of a rejected project with %i pending", (pendingCount) => {
		const callbacks = actions();
		const rejected = { ...project, status: "REJECTED" as const, pendingCount };
		render(<ProjectRowActionButton project={rejected} {...callbacks} />);

		fireEvent.click(screen.getByRole("button", { name: "Corrigir" }));

		expect(callbacks.onViewProject).toHaveBeenCalledWith(rejected);
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

	it("does not offer editing a draft, which Continuar already does", () => {
		render(<ProjectRowActionButton project={project} {...actions()} />);

		fireEvent.click(
			screen.getByRole("button", { name: `Ações do projeto ${project.name}` }),
		);

		expect(
			screen.queryByRole("menuitem", { name: "Editar Projeto" }),
		).not.toBeInTheDocument();
	});

	it("offers the admin editing, not correcting, another designer's rejection", () => {
		signInAs("admin", "9");
		const callbacks = actions();
		const rejected: Project = { ...project, status: "REJECTED" };
		render(<ProjectRowActionButton project={rejected} {...callbacks} />);

		expect(
			screen.getByRole("button", { name: /ver projeto/i }),
		).toBeInTheDocument();
		fireEvent.click(
			screen.getByRole("button", { name: `Ações do projeto ${project.name}` }),
		);
		expect(
			screen.queryByRole("menuitem", { name: "Excluir Projeto" }),
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("menuitem", { name: "Editar Projeto" }));
		expect(callbacks.onEditProject).toHaveBeenCalledWith(rejected);
	});

	it.each([
		"UNDER_REVIEW",
		"APPROVED",
	] as const)("offers the admin no change to a project in %s", (status) => {
		signInAs("admin", "9");
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
