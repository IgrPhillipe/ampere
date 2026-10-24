import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	idleMutation,
	loadedQuery,
	makeChecklist,
	makeFinding,
	makeProjectDetail,
	signInAs,
} from "@/test/fixtures/project-detail";

import { ProjectDetailPage } from "./ProjectDetailPage";

const state = vi.hoisted(() => ({
	project: undefined as unknown,
	findings: [] as unknown[],
	failed: false,
}));

vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () => loadedQuery({ data: state.project }),
}));

vi.mock("@services/project-review", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/project-review")>()),
	useGetFindingList: () => ({
		...loadedQuery(state.failed ? undefined : { data: state.findings }),
		isError: state.failed,
	}),
	useRespondFinding: () => idleMutation(),
	useGetDocumentFile: () => ({ isPending: true }),
}));

vi.mock("@services/calculation", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/calculation")>()),
	useGetLatestCalculation: () =>
		loadedQuery({
			data: {
				checks: [
					{
						code: "EV_NETWORK_STUDY",
						status: "WARNING",
						message: "Recarga acima de 20 kW exige estudo da rede.",
					},
				],
				steps: [],
				totals: { finalKva: 76 },
			},
		}),
}));

vi.mock("@services/consumer-units", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/consumer-units")>()),
	useGetConsumerUnitGroupList: () => loadedQuery({ data: [] }),
	useGetConsumerUnitGroupValidation: () =>
		loadedQuery({
			data: { totalUnits: 12, totalGroups: 2, totalDeclaredLoadKw: 80 },
		}),
}));

vi.mock("@services/submission", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/submission")>()),
	useGetSubmission: () => loadedQuery({ data: makeChecklist() }),
	useGetMemorial: () => ({ data: undefined }),
	useSubmitProject: () => idleMutation(),
}));

const renderPage = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ProjectDetailPage projectId="4" />
		</QueryClientProvider>,
	);

describe("ProjectDetailPage", () => {
	beforeEach(() => {
		state.findings = [makeFinding()];
		state.failed = false;
	});

	it("shows the shared header and tabs without the analysis label", () => {
		signInAs("user");
		state.project = makeProjectDetail();
		renderPage();

		expect(screen.getByText("Protocolo 2026-1004")).toBeVisible();
		expect(screen.queryByText(/Análise do Projeto/)).not.toBeInTheDocument();
		expect(screen.getByText("Criado em")).toBeVisible();
		expect(screen.getByText("Enviado em")).toBeVisible();
		for (const tab of [
			"Memória de Cálculo",
			"Unidades Consumidoras",
			"Documentos",
			"Histórico",
		]) {
			expect(screen.getByRole("tab", { name: tab })).toBeVisible();
		}
	});

	it("shows the automatic verification to the designer, read only", () => {
		signInAs("user");
		state.project = makeProjectDetail();
		renderPage();

		expect(screen.getByText("Verificação Automática")).toBeVisible();
		expect(
			screen.getByText("Recarga acima de 20 kW exige estudo da rede."),
		).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Virar Apontamento" }),
		).not.toBeInTheDocument();
	});

	it("lets the designer answer and resubmit a rejected project", () => {
		signInAs("user");
		state.project = makeProjectDetail({
			status: "REJECTED",
			reviewOpinion: "Corrija a ART.",
		});
		renderPage();

		expect(screen.getByRole("button", { name: "Corrigido" })).toBeVisible();
		expect(screen.getByRole("button", { name: "Contestar" })).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Reenviar Projeto" }),
		).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Aprovar Projeto" }),
		).not.toBeInTheDocument();
	});

	it("keeps the designer read only while the project is under review", () => {
		signInAs("user");
		state.project = makeProjectDetail({ status: "UNDER_REVIEW" });
		renderPage();

		expect(screen.getByText("O que Acontece Agora")).toBeVisible();
		expect(
			screen.queryByRole("button", { name: "Corrigido" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Reenviar Projeto" }),
		).not.toBeInTheDocument();
	});

	it("gives no designer action to another profile", () => {
		signInAs("admin");
		state.project = makeProjectDetail({ status: "REJECTED" });
		renderPage();

		expect(
			screen.queryByRole("button", { name: "Corrigido" }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Reenviar Projeto" }),
		).not.toBeInTheDocument();
	});

	it("offers a retry when the findings fail to load", () => {
		signInAs("user");
		state.project = makeProjectDetail({ status: "REJECTED" });
		state.failed = true;
		renderPage();

		expect(
			screen.getByText("Não foi possível carregar os apontamentos"),
		).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Tentar Novamente" }),
		).toBeVisible();
		expect(
			screen.queryByText("Nenhum apontamento publicado para este projeto."),
		).not.toBeInTheDocument();
	});
});
