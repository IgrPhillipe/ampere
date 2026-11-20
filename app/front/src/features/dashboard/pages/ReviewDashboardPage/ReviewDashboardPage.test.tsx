import { useAuthStore } from "@features/shared";
import type { ReviewDashboard } from "@services/dashboard";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery, signInAs } from "@/test/fixtures/project-detail";

import { ReviewDashboardPage } from "./ReviewDashboardPage";

const state = vi.hoisted(() => ({
	query: {} as Record<string, unknown>,
	periods: [] as string[],
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		params,
		...props
	}: {
		children: ReactNode;
		to: string;
		params?: { id: string };
	}) => (
		<a href={params ? to.replace("$id", params.id) : to} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@services/dashboard", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/dashboard")>()),
	useGetReviewDashboard: (period: string) => {
		state.periods.push(period);

		return state.query;
	},
}));

const makeDashboard = (
	overrides: Partial<ReviewDashboard> = {},
): ReviewDashboard => ({
	totals: { received: 31, approved: 14, rejected: 9, underReview: 8 },
	averageReviewDays: 6.5,
	averageCycleDays: null,
	weekly: [
		{ weekStart: "2026-11-02", received: 7, decided: 5 },
		{ weekStart: "2026-11-09", received: 4, decided: 6 },
	],
	monthlyRejection: [{ month: "2026-10", rejectionPercent: 40 }],
	deadlines: { met: 20, overdue: 3 },
	workload: [{ id: "7", name: "Ana Analista", underReview: 5 }],
	findingsRanking: [
		{
			stage: "CALCULATION",
			standardItem: "Fator de demanda",
			total: 12,
			projects: [
				{ id: "41", name: "Edifício Aurora", protocol: "2026-0481" },
				{ id: "42", name: "Residencial Boa Vista", protocol: "2026-0482" },
			],
		},
		{ stage: "DOCUMENTS", standardItem: null, total: 4, projects: [] },
	],
	municipalities: [{ municipality: "Recife", state: "PE", total: 11 }],
	repeatedRejections: [
		{ id: "50", name: "Comercial Derby", protocol: "2026-0490", rejections: 3 },
	],
	alertsByCategory: [
		{ category: "RESIDENTIAL_MULTIFAMILY", alerts: 15, projects: 10 },
		{ category: "NON_RESIDENTIAL", alerts: 4, projects: 1 },
		{ category: "MIXED", alerts: 0, projects: 2 },
	],
	...overrides,
});

const renderPage = (searchParams = "") =>
	render(<ReviewDashboardPage />, {
		wrapper: withNuqsTestingAdapter({ searchParams, hasMemory: true }),
	});

describe("ReviewDashboardPage", () => {
	beforeEach(() => {
		state.periods = [];
		state.query = loadedQuery({ data: makeDashboard() });
		signInAs("reviewer");
	});

	afterEach(() => useAuthStore.getState().logout());

	it("shows the period's projects by situation", () => {
		renderPage();

		const band = screen.getByRole("region", {
			name: "Seus projetos no período, Últimos 30 Dias",
		});

		expect(within(band).getByText("Aprovados").nextSibling).toHaveTextContent(
			"14",
		);
		expect(within(band).getByText("Reprovados").nextSibling).toHaveTextContent(
			"09",
		);
		expect(within(band).getByText("Em análise").nextSibling).toHaveTextContent(
			"08",
		);
	});

	it("keeps the workload by analyst to the admin", () => {
		renderPage();

		expect(
			screen.queryByRole("region", { name: "Em Análise por Analista" }),
		).not.toBeInTheDocument();
	});

	it("shows the admin the whole team", () => {
		signInAs("admin");
		renderPage();

		expect(
			screen.getByRole("region", {
				name: "Projetos da equipe no período, Últimos 30 Dias",
			}),
		).toBeInTheDocument();
		expect(
			within(
				screen.getByRole("region", { name: "Em Análise por Analista" }),
			).getByText("Ana Analista").nextSibling,
		).toHaveTextContent("05");
	});

	it("asks for the period picked, starting from the last 30 days", () => {
		renderPage();

		expect(state.periods.at(-1)).toBe("LAST_30_DAYS");

		fireEvent.click(screen.getByRole("button", { name: "Últimos 90 Dias" }));

		expect(state.periods.at(-1)).toBe("LAST_90_DAYS");
		expect(
			screen.getByRole("region", {
				name: "Seus projetos no período, Últimos 90 Dias",
			}),
		).toBeInTheDocument();
	});

	it("ranks the findings and lists the projects of the item clicked", () => {
		renderPage("?period=LAST_90_DAYS");

		const ranking = screen.getByRole("region", {
			name: "Apontamentos Mais Frequentes",
		});
		const item = within(ranking).getByRole("button", {
			name: /Cálculo de Demanda: Fator de demanda\s*12/,
		});

		expect(item).toHaveAttribute("aria-expanded", "false");
		expect(within(ranking).queryByRole("link")).not.toBeInTheDocument();

		fireEvent.click(item);

		const projects = within(ranking).getByRole("list", {
			name: "Projetos com o apontamento Cálculo de Demanda: Fator de demanda",
		});

		expect(item).toHaveAttribute("aria-expanded", "true");
		expect(
			within(projects).getByRole("link", { name: "Edifício Aurora" }),
		).toHaveAttribute("href", "/projetos/41");
		expect(within(projects).getByText("2026-0482")).toBeInTheDocument();
	});

	it("lists the projects rejected more than once", () => {
		renderPage();

		const section = screen.getByRole("region", {
			name: "Mais de Uma Reprovação",
		});

		expect(
			within(section).getByRole("link", { name: "Comercial Derby" }),
		).toHaveAttribute("href", "/projetos/50");
		expect(within(section).getByText("3 reprovações")).toBeInTheDocument();
	});

	it("splits the alerts by the building's category", () => {
		renderPage();

		const section = screen.getByRole("region", {
			name: "Alertas por Categoria",
		});

		expect(
			within(section).getByText("Residencial multifamiliar, 10 projetos")
				.nextSibling,
		).toHaveTextContent("15");
		expect(
			within(section).getByText("Não residencial, 1 projeto"),
		).toBeInTheDocument();
		expect(within(section).getByText("Misto, 2 projetos")).toBeInTheDocument();
	});

	it("reads the times, deadlines and weeks of the period", () => {
		renderPage();

		const times = screen.getByRole("region", { name: "Tempos e Prazos" });

		expect(
			within(times).getByText("Tempo médio de análise").nextSibling,
		).toHaveTextContent("6,5 d");
		expect(within(times).getByText("Sem aprovação")).toBeInTheDocument();
		expect(
			within(times).getByText("Prazos vencidos").nextSibling,
		).toHaveTextContent("03");
		expect(
			screen.getByLabelText("Semana de 09/11: 4 recebidos, 6 decididos"),
		).toBeInTheDocument();
	});

	it("says so when the period has no findings", () => {
		state.query = loadedQuery({
			data: makeDashboard({ findingsRanking: [], repeatedRejections: [] }),
		});
		renderPage();

		expect(
			screen.getByText("Nenhum apontamento emitido no período."),
		).toBeInTheDocument();
		expect(
			screen.getByText("Nenhum projeto reprovado mais de uma vez no período."),
		).toBeInTheDocument();
	});

	it("offers a retry when the indicators fail", () => {
		const refetch = vi.fn();
		state.query = { isError: true, isPending: false, refetch };
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));

		expect(refetch).toHaveBeenCalled();
	});
});
