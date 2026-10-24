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
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	useMatchRoute: () => () => false,
	Outlet: () => <p>Conteúdo da seção</p>,
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: state.project }),
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
});
