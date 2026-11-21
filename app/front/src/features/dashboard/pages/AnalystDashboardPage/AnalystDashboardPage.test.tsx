import type { ReviewQueueItem } from "@services/review-queue";
import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery } from "@/test/fixtures/project-detail";

import { AnalystDashboardPage } from "./AnalystDashboardPage";

const state = vi.hoisted(() => ({
	indicatorsQuery: {} as Record<string, unknown>,
	lists: {} as Record<string, unknown>,
	failed: false,
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
		render(<AnalystDashboardPage />);

		const band = screen.getByRole("region", { name: "Seus projetos hoje" });
		expect(within(band).getByText("Em análise").nextSibling).toHaveTextContent(
			"09",
		);
		expect(
			within(band).getByText("Reprovação no mês").nextSibling,
		).toHaveTextContent("72,7%");
	});

	it("lists what is due first and links the decided ones to Projetos", () => {
		render(<AnalystDashboardPage />);

		const next = screen.getByRole("region", { name: "Em Análise" });
		expect(within(next).getAllByRole("listitem")).toHaveLength(2);

		const projects = screen.getByRole("region", { name: "Seus Projetos" });
		expect(
			within(projects).getByRole("link", { name: "Aprovados" }),
		).toHaveAttribute("href", "/projetos?filter=APPROVED");
	});

	it("asks to review what is overdue or due today", () => {
		render(<AnalystDashboardPage />);

		const actions = screen.getByRole("region", { name: "Exige Ação" });
		expect(
			within(actions).getByRole("link", {
				name: "Analisar Condomínio Jardim Recife",
			}),
		).toHaveAttribute("href", "/projetos/1");
	});

	it("offers to retry when a list fails", () => {
		state.failed = true;
		render(<AnalystDashboardPage />);

		expect(
			screen.getByText("Não foi possível carregar o painel"),
		).toBeInTheDocument();
	});
});
