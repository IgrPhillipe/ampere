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

import { ProjectWorkspaceContext } from "../../components";
import { ProjectOverviewPage } from "./ProjectOverviewPage";

const state = vi.hoisted(() => ({
	project: undefined as unknown,
	findings: [] as unknown[],
	failed: false,
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

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
}));

vi.mock("@services/calculation", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/calculation")>()),
	useGetLatestCalculation: () =>
		loadedQuery({
			data: {
				checks: [],
				checksCount: 9,
				warningsCount: 1,
				steps: [],
				totals: { finalKva: 76 },
				outdated: false,
			},
		}),
}));

vi.mock("@services/consumer-units", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/consumer-units")>()),
	useGetConsumerUnitGroupList: () => loadedQuery({ data: [] }),
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
	useGetSubmission: () => loadedQuery({ data: makeChecklist() }),
	useSubmitProject: () => idleMutation(),
}));

const renderPage = (reviewing = false) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<ProjectWorkspaceContext value={{ reviewing, registrar: {} }}>
				<ProjectOverviewPage projectId="4" />
			</ProjectWorkspaceContext>
		</QueryClientProvider>,
	);

describe("ProjectOverviewPage", () => {
	beforeEach(() => {
		state.findings = [makeFinding()];
		state.failed = false;
	});

	it("sums up each section of the project", () => {
		signInAs("user");
		state.project = makeProjectDetail();
		renderPage();

		expect(screen.getByText("Resumo do Projeto")).toBeVisible();
		expect(screen.getByText("Residencial multifamiliar")).toBeVisible();
		expect(screen.getByText("12 unidades")).toBeVisible();
		expect(screen.getByText("76,0 kVA")).toBeVisible();
		expect(screen.getByText("09 conferências, 01 alerta")).toBeVisible();
	});

	it("lets the designer answer and resubmit a rejected project", () => {
		signInAs("user");
		state.project = makeProjectDetail({
			status: "REJECTED",
			reviewOpinion: "Corrija a ART.",
		});
		renderPage();

		expect(screen.getByText("Corrija a ART.")).toBeVisible();
		expect(
			screen.getByRole("button", { name: "Reenviar Projeto" }),
		).toBeVisible();

		fireEvent.click(screen.getByRole("button", { name: /A ART não traz/ }));
		expect(screen.getByRole("button", { name: "Corrigido" })).toBeVisible();
		expect(screen.getByRole("button", { name: "Contestar" })).toBeVisible();
		expect(
			screen.getByRole("button", { name: /Ir para a Seção/ }),
		).toBeVisible();
	});

	it("keeps the designer read only while the project is under review", () => {
		signInAs("user");
		state.project = makeProjectDetail({ status: "UNDER_REVIEW" });
		renderPage();

		expect(screen.getByText("O que Acontece Agora")).toBeVisible();
		expect(screen.queryByText("Apontamentos")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Corrigido" }),
		).not.toBeInTheDocument();
	});

	it("leaves the findings to the review panel of the analyst", () => {
		signInAs("reviewer");
		state.project = makeProjectDetail();
		renderPage(true);

		expect(screen.getByText("Resumo do Projeto")).toBeVisible();
		expect(screen.queryByText("Apontamentos")).not.toBeInTheDocument();
		expect(screen.queryByText("O que Acontece Agora")).not.toBeInTheDocument();
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
	});
});
