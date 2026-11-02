import type { DesignerDashboard } from "@services/dashboard";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery } from "@/test/fixtures/project-detail";

import { DesignerDashboardPage } from "./DesignerDashboardPage";

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
	useGetDesignerDashboard: (period: string) => {
		state.periods.push(period);

		return state.query;
	},
}));

const makeDashboard = (
	overrides: Partial<DesignerDashboard> = {},
): DesignerDashboard => ({
	hasSubmissions: true,
	actionRequired: [],
	underReview: [],
	indicators: {
		submitted: 9,
		firstReviewApprovalPercent: 56,
		averageDaysToApproval: 21,
		approvedDemand: 612,
	},
	findingsRanking: [],
	...overrides,
});

const renderPage = (searchParams = "") =>
	render(<DesignerDashboardPage />, {
		wrapper: withNuqsTestingAdapter({ searchParams, hasMemory: true }),
	});

describe("DesignerDashboardPage", () => {
	beforeEach(() => {
		state.periods = [];
		state.query = loadedQuery({ data: makeDashboard() });
	});

	it("shows a rejected project with its blocking findings and the shortcut to them", () => {
		state.query = loadedQuery({
			data: makeDashboard({
				actionRequired: [
					{
						id: "7",
						name: "Edifício Residencial Aurora",
						protocol: "2026-0481",
						status: "REJECTED",
						blockingFindings: 2,
						idleDays: null,
					},
					{
						id: "9",
						name: "Edifício Torre Norte",
						protocol: null,
						status: "DRAFT",
						blockingFindings: 0,
						idleDays: 21,
					},
				],
			}),
		});
		renderPage();

		const actions = screen.getByRole("region", { name: "Exige Ação" });

		expect(actions).toHaveTextContent("02 bloqueantes");
		expect(
			screen.getByRole("link", { name: /ver apontamentos/i }),
		).toHaveAttribute("href", "/projetos/7");
		expect(actions).toHaveTextContent("Parado há 21 dias");
		expect(
			screen.getByRole("link", { name: /continuar rascunho/i }),
		).toHaveAttribute("href", "/projetos/9");
	});

	it("offers the resubmission for a rejected project without blocking findings", () => {
		state.query = loadedQuery({
			data: makeDashboard({
				actionRequired: [
					{
						id: "8",
						name: "Edifício Madalena",
						protocol: "2026-0477",
						status: "REJECTED",
						blockingFindings: 0,
						idleDays: null,
					},
				],
			}),
		});
		renderPage();

		expect(
			screen.getByRole("region", { name: "Exige Ação" }),
		).not.toHaveTextContent(/bloqueante/i);
		expect(
			screen.getByRole("link", { name: /reenviar projeto/i }),
		).toHaveAttribute("href", "/projetos/8");
		expect(
			screen.queryByRole("link", { name: /ver apontamentos/i }),
		).not.toBeInTheDocument();
	});

	it("shows the period indicators and an overdue review", () => {
		state.query = loadedQuery({
			data: makeDashboard({
				underReview: [
					{
						id: "12",
						name: "Comercial Derby",
						protocol: "2026-0490",
						deadline: "2026-10-30",
						daysRemaining: -3,
					},
				],
				findingsRanking: [
					{ stage: "CALCULATION", standardItem: "Quadro 33", total: 5 },
				],
			}),
		});
		renderPage();

		expect(screen.getByText("Projetos enviados").nextSibling).toHaveTextContent(
			"09",
		);
		expect(screen.getByText("56%")).toBeInTheDocument();
		expect(
			screen.getByText("Cálculo de Demanda: Quadro 33"),
		).toBeInTheDocument();
		const underReview = screen.getByRole("region", { name: "Em Análise" });

		expect(underReview).toHaveTextContent("Atrasado");
		expect(underReview).toHaveTextContent("Há 3 dias");
		expect(underReview).toHaveTextContent("Venceu em 30/10/2026");
	});

	it("counts the days left until the review deadline", () => {
		state.query = loadedQuery({
			data: makeDashboard({
				underReview: [
					{
						id: "13",
						name: "Residencial Graças",
						protocol: "2026-0472",
						deadline: "2026-11-02",
						daysRemaining: 0,
					},
					{
						id: "14",
						name: "Edifício Boa Vista",
						protocol: "2026-0485",
						deadline: "2026-11-03",
						daysRemaining: 1,
					},
				],
			}),
		});
		renderPage();

		const [dueToday, dueTomorrow] = within(
			screen.getByRole("region", { name: "Em Análise" }),
		).getAllByRole("listitem");

		expect(dueToday).toHaveTextContent("Vence Hoje");
		expect(dueToday).toHaveTextContent("Vence em 02/11/2026");
		expect(dueToday).not.toHaveTextContent("restante");
		expect(dueTomorrow).toHaveTextContent("No Prazo");
		expect(dueTomorrow).toHaveTextContent("1 dia restante");
		expect(dueTomorrow).toHaveTextContent("Vence em 03/11/2026");
	});

	it("explains the indicators the period cannot measure yet", () => {
		state.query = loadedQuery({
			data: makeDashboard({
				indicators: {
					submitted: 2,
					firstReviewApprovalPercent: null,
					averageDaysToApproval: null,
					approvedDemand: 0,
				},
			}),
		});
		renderPage();

		expect(
			screen.getByText("Aprovados na 1ª análise").nextSibling,
		).toHaveTextContent("Sem análise");
		expect(
			screen.getByText("Tempo médio até aprovação").nextSibling,
		).toHaveTextContent("Sem aprovação");
	});

	it("explains the indicators and offers a new project before the first submission", () => {
		state.query = loadedQuery({
			data: makeDashboard({
				hasSubmissions: false,
				indicators: {
					submitted: 0,
					firstReviewApprovalPercent: null,
					averageDaysToApproval: null,
					approvedDemand: 0,
				},
			}),
		});
		renderPage();

		expect(
			screen.getByText("Os indicadores aparecem depois do primeiro envio."),
		).toBeInTheDocument();
		expect(screen.queryByText("Projetos enviados")).not.toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Novo Projeto" }),
		).toHaveAttribute("href", "/projetos/novo");
	});

	it("asks for the selected period", () => {
		renderPage("?period=CURRENT_YEAR");

		expect(state.periods.at(-1)).toBe("CURRENT_YEAR");
		expect(
			screen.getByRole("button", { name: "Ano Corrente" }),
		).toHaveAttribute("aria-pressed", "true");

		fireEvent.click(screen.getByRole("button", { name: "Últimos 90 Dias" }));

		expect(state.periods.at(-1)).toBe("LAST_90_DAYS");
	});

	it("offers a retry when the dashboard fails to load", () => {
		const refetch = vi.fn();
		state.query = { isPending: false, isError: true, refetch };
		renderPage();

		expect(
			screen.getByText("Não foi possível carregar o painel"),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));

		expect(refetch).toHaveBeenCalled();
	});

	it("shows skeletons while loading", () => {
		state.query = { isPending: true, isError: false };
		renderPage();

		expect(screen.getByText("Projetos enviados")).toBeInTheDocument();
		expect(
			screen.queryByText("Nada exige sua ação agora."),
		).not.toBeInTheDocument();
	});
});
