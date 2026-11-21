import type { ReviewQueueItem } from "@services/review-queue";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery } from "@/test/fixtures/project-detail";
import { reviewDashboardOf } from "@/test/fixtures/review-dashboard";

import { AnalystDashboardPage } from "./AnalystDashboardPage";

const state = vi.hoisted(() => ({
	indicatorsQuery: {} as Record<string, unknown>,
	lists: {} as Record<string, unknown>,
	failed: false,
	reviewQuery: {} as Record<string, unknown>,
	periods: [] as string[],
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		params,
		search,
		...props
	}: {
		children: ReactNode;
		to: string;
		params?: { id: string };
		search?: Record<string, string>;
	}) => {
		const query = search && Object.keys(search).length > 0;
		const href =
			(params ? to.replace("$id", params.id) : to) +
			(query ? `?${new URLSearchParams(search)}` : "");
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	},
}));

vi.mock("@services/review-queue", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/review-queue")>()),
	useGetReviewQueueIndicators: () => state.indicatorsQuery,
	useGetReviewQueue: ({ filter }: { filter: string }) =>
		state.failed
			? { isError: true, refetch: vi.fn() }
			: loadedQuery({ data: state.lists[filter] }),
}));

vi.mock("@services/dashboard", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/dashboard")>()),
	useGetReviewDashboard: (period: string) => {
		state.periods.push(period);

		return state.reviewQuery;
	},
}));

const renderPage = (searchParams = "") =>
	render(<AnalystDashboardPage />, {
		wrapper: withNuqsTestingAdapter({ searchParams, hasMemory: true }),
	});

const itemOf = (
	id: string,
	name: string,
	deadlineStatus: ReviewQueueItem["deadlineStatus"],
	daysRemaining: number,
): ReviewQueueItem => ({
	id,
	name,
	protocol: `2026-000${id}`,
	status: "UNDER_REVIEW",
	reviewedAt: null,
	municipality: "Recife",
	state: "PE",
	submittedAt: "2026-10-20T12:00:00Z",
	deadline: "2026-11-19",
	deadlineStatus,
	daysRemaining,
	elapsedDays: 12,
	suspendedDays: 0,
	warnings: 0,
	alerts: [],
	ownerId: "5",
	ownerName: "Carla Projetista",
	consumerUnitsCount: 12,
	demandKva: 40,
	reanalysis: false,
	reviewCycle: 1,
	reviewerId: "7",
	reviewerName: "Ana Analista",
});

describe("AnalystDashboardPage", () => {
	beforeEach(() => {
		state.failed = false;
		state.periods = [];
		state.reviewQuery = loadedQuery({ data: reviewDashboardOf() });
		state.indicatorsQuery = loadedQuery({
			data: {
				total: 9,
				dueSoon: 5,
				highDemand: 6,
				reanalysis: 5,
				reviewedToday: 1,
				monthlyRejectionPercent: 72.7,
				approved: 6,
				rejected: 9,
			},
		});
		state.lists = {
			ALL: [
				itemOf("1", "Condomínio Jardim Recife", "OVERDUE", -18),
				itemOf("2", "Residencial Aurora", "ON_TIME", 12),
			],
			DUE_SOON: [itemOf("1", "Condomínio Jardim Recife", "OVERDUE", -18)],
		};
	});

	it("puts the analyst's figures on the green band", () => {
		renderPage();

		const band = screen.getByRole("region", { name: "Seus projetos hoje" });
		expect(within(band).getByText("Em análise").nextSibling).toHaveTextContent(
			"09",
		);
		expect(
			within(band).getByText("Reprovação no mês").nextSibling,
		).toHaveTextContent("72,7%");
	});

	it("lists what is due first and links the decided ones to Projetos", () => {
		renderPage();

		const next = screen.getByRole("region", { name: "Em Análise" });
		expect(within(next).getAllByRole("listitem")).toHaveLength(2);

		const projects = screen.getByRole("region", { name: "Seus Projetos" });
		expect(
			within(projects).getByRole("link", { name: "Aprovados" }),
		).toHaveAttribute("href", "/projetos?filter=APPROVED");
	});

	it("asks to review what is overdue or due today", () => {
		renderPage();

		const actions = screen.getByRole("region", { name: "Exige Ação" });
		expect(
			within(actions).getByRole("link", {
				name: "Analisar Condomínio Jardim Recife",
			}),
		).toHaveAttribute("href", "/projetos/1");
	});

	it("offers to retry when a list fails", () => {
		state.failed = true;
		renderPage();

		expect(
			screen.getByText("Não foi possível carregar o painel"),
		).toBeInTheDocument();
	});

	it("follows the band and the lists with the indicators of the period", () => {
		renderPage();

		const totals = screen.getByRole("region", { name: /Projetos no Período/ });
		expect(within(totals).getByText("Últimos 30 Dias")).toBeInTheDocument();
		expect(within(totals).getByText("Recebidos").nextSibling).toHaveTextContent(
			"31",
		);
		expect(
			screen.getByRole("region", { name: /Recebidos e Decididos/ }),
		).toBeInTheDocument();
		expect(
			within(
				screen.getByRole("region", { name: /Apontamentos Mais Frequentes/ }),
			).getByText("12"),
		).toBeInTheDocument();
		const times = screen.getByRole("region", { name: "Tempos e Prazos" });
		expect(
			within(times).getByText("Tempo médio de análise").nextSibling,
		).toHaveTextContent("6,5 dias");
		expect(
			within(times).getByText("Ciclo completo até a aprovação").nextSibling,
		).toHaveTextContent("Sem aprovação");
		expect(
			within(
				screen.getByRole("region", { name: /Taxa de Reprovação/ }),
			).getByText("Outubro de 2026").nextSibling,
		).toHaveTextContent("40%");
		expect(
			within(
				screen.getByRole("region", { name: /Alertas por Categoria/ }),
			).getByText("15 alertas"),
		).toBeInTheDocument();
		expect(
			within(
				screen.getByRole("region", { name: "Municípios com Mais Projetos" }),
			).getByText("Recife/PE"),
		).toBeInTheDocument();
		expect(
			within(
				screen.getByRole("region", { name: /Mais de Uma Reprovação/ }),
			).getByRole("link", { name: "Comercial Derby" }),
		).toHaveAttribute("href", "/projetos/50");
		// The panel already lists the load per analyst for the admin only.
		expect(
			screen.queryByRole("region", { name: /Em Análise por Analista/ }),
		).not.toBeInTheDocument();
	});

	it("lists only the months with decisions in the rejection rate", () => {
		state.reviewQuery = loadedQuery({
			data: reviewDashboardOf({
				monthlyRejection: [
					{ month: "2026-09", rejectionPercent: null },
					{ month: "2026-10", rejectionPercent: 25 },
				],
			}),
		});
		renderPage();

		const rate = screen.getByRole("region", { name: /Taxa de Reprovação/ });
		expect(
			within(rate).queryByText("Setembro de 2026"),
		).not.toBeInTheDocument();
		expect(
			within(rate).getByText("Outubro de 2026").nextSibling,
		).toHaveTextContent("25%");
	});

	it("explains a period without decisions in the rejection rate", () => {
		state.reviewQuery = loadedQuery({
			data: reviewDashboardOf({
				monthlyRejection: [{ month: "2026-10", rejectionPercent: null }],
			}),
		});
		renderPage();

		expect(
			within(
				screen.getByRole("region", { name: /Taxa de Reprovação/ }),
			).getByText("Nenhuma decisão no período."),
		).toBeInTheDocument();
	});

	it("asks the indicators for the period picked", () => {
		renderPage("?period=CURRENT_YEAR");

		expect(state.periods.at(-1)).toBe("CURRENT_YEAR");
		expect(
			screen.getByRole("button", { name: "Ano Corrente" }),
		).toHaveAttribute("aria-pressed", "true");

		fireEvent.click(screen.getByRole("button", { name: "Últimos 90 Dias" }));

		expect(state.periods.at(-1)).toBe("LAST_90_DAYS");
		expect(
			within(
				screen.getByRole("region", { name: /Projetos no Período/ }),
			).getByText("Últimos 90 Dias"),
		).toBeInTheDocument();
	});

	it("keeps the panel when only the indicators fail", () => {
		const refetch = vi.fn();
		state.reviewQuery = { isError: true, refetch };
		renderPage();

		expect(
			screen.getByText("Não foi possível carregar os indicadores do período"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Seus projetos hoje" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Exige Ação" }),
		).toBeInTheDocument();
		expect(
			screen.queryByText("Não foi possível carregar o painel"),
		).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));

		expect(refetch).toHaveBeenCalled();
	});
});
