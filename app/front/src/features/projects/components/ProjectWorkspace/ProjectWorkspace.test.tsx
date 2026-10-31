import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	idleMutation,
	loadedQuery,
	makeChecklist,
	makeFinding,
	makeProjectDetail,
	signInAs,
} from "@/test/fixtures/project-detail";

import { ProjectWorkspace } from "./ProjectWorkspace";

const state = vi.hoisted(() => ({
	project: undefined as unknown,
	findings: [] as unknown[],
	canSubmit: true,
	submit: vi.fn(),
	remove: vi.fn(),
	navigate: vi.fn(),
	onDeleted: undefined as (() => void) | undefined,
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => state.navigate,
	useMatchRoute: () => () => false,
	Outlet: () => <p>Conteúdo da seção</p>,
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: state.project }),
	useDeleteProject: (options: { onDeleted: () => void }) => {
		state.onDeleted = options.onDeleted;
		return idleMutation({ mutate: state.remove });
	},
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useGetFindingList: () => loadedQuery({ data: state.findings }),
}));

vi.mock("@services/calculation", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/calculation")>()),
	useGetLatestCalculation: () => loadedQuery(null),
}));

vi.mock("@services/consumer-units", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/consumer-units")>()),
	useGetConsumerUnitGroupValidation: () =>
		loadedQuery({
			data: {
				canCalculate: true,
				pendingCount: 0,
				totalUnits: 12,
				totalGroups: 2,
				totalDeclaredLoadKw: 80,
			},
		}),
}));

vi.mock("@services/submission", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/submission")>()),
	useGetSubmission: () =>
		loadedQuery({ data: makeChecklist({ canSubmit: state.canSubmit }) }),
	useSubmitProject: () => idleMutation({ mutate: state.submit }),
}));

const renderWorkspace = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ProjectWorkspace projectId="4" />
		</QueryClientProvider>,
	);

describe("ProjectWorkspace", () => {
	beforeEach(() => {
		state.findings = [];
		state.canSubmit = true;
		state.submit.mockClear();
		state.remove.mockClear();
		state.navigate.mockClear();
	});

	it("keeps the header and the sections around the open section", () => {
		signInAs("user");
		state.project = makeProjectDetail();
		renderWorkspace();

		expect(screen.getByText("Protocolo 2026-1004")).toBeVisible();
		expect(screen.getByText("Conteúdo da seção")).toBeVisible();
		for (const section of [
			"Visão Geral",
			"Dados da Edificação",
			"Unidades Consumidoras",
			"Cálculo de Demanda",
			"Memorial",
			"Documentos",
			"Histórico",
		]) {
			expect(
				screen.getByRole("link", { name: new RegExp(`^${section}`) }),
			).toBeVisible();
		}
		expect(screen.queryByRole("tab")).not.toBeInTheDocument();
	});

	it("holds the section until the project loads", () => {
		signInAs("reviewer");
		state.project = undefined;
		renderWorkspace();

		expect(screen.queryByText("Conteúdo da seção")).not.toBeInTheDocument();
	});

	it("marks every section of a sent project as done", () => {
		signInAs("user");
		state.project = makeProjectDetail({ status: "APPROVED" });
		renderWorkspace();

		for (const section of [
			"Dados da Edificação",
			"Unidades Consumidoras",
			"Cálculo de Demanda",
			"Memorial",
			"Documentos",
		]) {
			expect(
				screen.getByRole("link", { name: `${section}(concluído)` }),
			).toBeVisible();
		}
	});

	it("tells the designer the data stays locked while under review", () => {
		signInAs("user");
		state.project = makeProjectDetail();
		renderWorkspace();

		expect(screen.getByRole("status")).toHaveTextContent(
			"Enviado em 02/10/2026. Os dados ficam bloqueados até o parecer do analista.",
		);
	});

	it("lets the owner send a complete draft from any section", () => {
		signInAs("user");
		state.project = makeProjectDetail({ status: "DRAFT", ownerId: "1" });
		renderWorkspace();

		fireEvent.click(
			screen.getByRole("button", { name: "Enviar para Análise" }),
		);
		expect(state.submit).toHaveBeenCalledWith(
			{ projectId: "4" },
			expect.anything(),
		);
	});

	it("explains why a draft cannot be sent yet", () => {
		signInAs("user");
		state.project = makeProjectDetail({ status: "DRAFT", ownerId: "1" });
		state.canSubmit = false;
		renderWorkspace();

		expect(
			screen.getByRole("button", { name: "Enviar para Análise" }),
		).toBeDisabled();
		expect(
			screen.getByText("Conclua as seções marcadas para enviar."),
		).toBeVisible();
	});

	it("points the designer of a rejected project to the resubmission", () => {
		signInAs("user");
		state.project = makeProjectDetail({ status: "REJECTED", ownerId: "1" });
		state.findings = [makeFinding()];
		renderWorkspace();

		expect(
			screen.getByRole("link", { name: "Reenviar Projeto" }),
		).toBeVisible();
		expect(screen.getByText("Versão").nextElementSibling).toHaveTextContent(
			/^2$/,
		);
		// The finding on the ART is counted on the section where it is fixed.
		expect(
			screen.getByRole("link", { name: /^Documentos.*1 apontamento/ }),
		).toBeVisible();
	});

	it("gives no designer action to an admin who does not own the project", () => {
		signInAs("admin");
		state.project = makeProjectDetail({ status: "REJECTED", ownerId: "2" });
		renderWorkspace();

		expect(
			screen.queryByRole("link", { name: "Reenviar Projeto" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Enviar para Análise" }),
		).not.toBeInTheDocument();
	});

	it("shows the designer the open findings of a sent project", () => {
		signInAs("user");
		state.project = makeProjectDetail({
			status: "REJECTED",
			ownerId: "1",
			openFindingsCount: 3,
		});
		renderWorkspace();

		expect(
			screen.getByText("Apontamentos em aberto").nextElementSibling,
		).toHaveTextContent(/^03$/);
	});

	it("shows the analyst their own figures instead of the open findings", () => {
		signInAs("reviewer");
		state.project = makeProjectDetail({
			status: "UNDER_REVIEW",
			openFindingsCount: 3,
		});
		render(
			<QueryClientProvider client={new QueryClient()}>
				<ProjectWorkspace
					projectId="4"
					reviewing
					metrics={[{ label: "Pendências", value: "02" }]}
				/>
			</QueryClientProvider>,
		);

		expect(screen.getByText("Pendências").nextElementSibling).toHaveTextContent(
			/^02$/,
		);
		expect(
			screen.queryByText("Apontamentos em aberto"),
		).not.toBeInTheDocument();
	});

	it("leaves the open findings out of a draft never sent", () => {
		signInAs("user");
		state.project = makeProjectDetail({
			status: "DRAFT",
			ownerId: "1",
			reviewCycle: 0,
		});
		renderWorkspace();

		expect(
			screen.queryByText("Apontamentos em aberto"),
		).not.toBeInTheDocument();
	});

	it("lets the owner delete a draft and returns to the list", () => {
		signInAs("user");
		state.project = makeProjectDetail({ status: "DRAFT", ownerId: "1" });
		renderWorkspace();

		fireEvent.click(screen.getByRole("button", { name: "Excluir Projeto" }));
		expect(screen.getByText("Excluir projeto?")).toBeVisible();
		// The open dialog hides the page, so only its own button is left.
		fireEvent.click(screen.getByRole("button", { name: "Excluir Projeto" }));

		expect(state.remove).toHaveBeenCalledWith("4");
		state.onDeleted?.();
		expect(state.navigate).toHaveBeenCalledWith({
			to: "/projetos",
			replace: true,
		});
	});

	it("lets an admin delete a draft they do not own", () => {
		signInAs("admin");
		state.project = makeProjectDetail({ status: "DRAFT", ownerId: "2" });
		renderWorkspace();

		expect(
			screen.getByRole("button", { name: "Excluir Projeto" }),
		).toBeVisible();
	});

	it.each([
		"AWAITING_SUBMISSION",
		"UNDER_REVIEW",
		"REJECTED",
		"APPROVED",
	] as const)("keeps a %s project from being deleted", (status) => {
		signInAs("user");
		state.project = makeProjectDetail({ status, ownerId: "1" });
		renderWorkspace();

		expect(
			screen.queryByRole("button", { name: "Excluir Projeto" }),
		).not.toBeInTheDocument();
	});

	it("gives the analyst no delete action", () => {
		signInAs("reviewer");
		state.project = makeProjectDetail({ status: "DRAFT", ownerId: "2" });
		renderWorkspace();

		expect(
			screen.queryByRole("button", { name: "Excluir Projeto" }),
		).not.toBeInTheDocument();
	});
});
