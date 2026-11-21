import type { AdminDashboard } from "@services/dashboard";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery } from "@/test/fixtures/project-detail";
import { reviewDashboardOf } from "@/test/fixtures/review-dashboard";

import { AdminDashboardPage } from "./AdminDashboardPage";

const state = vi.hoisted(() => ({
	dashboardQuery: {} as Record<string, unknown>,
	reviewQuery: {} as Record<string, unknown>,
	periods: [] as string[],
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => vi.fn(),
	Link: ({
		children,
		to,
		search,
		params,
		...props
	}: {
		children: ReactNode;
		to: string;
		search?: Record<string, unknown>;
		params?: { id: string };
	}) => {
		const searchStr = search
			? "?" + new URLSearchParams(search as Record<string, string>).toString()
			: "";
		const href = (params ? to.replace("$id", params.id) : to) + searchStr;
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	},
}));

vi.mock("@services/dashboard", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/dashboard")>()),
	useGetAdminDashboard: () => state.dashboardQuery,
	useGetReviewDashboard: (period: string) => {
		state.periods.push(period);

		return state.reviewQuery;
	},
}));

const makeAdminDashboard = (
	overrides: Partial<AdminDashboard> = {},
): AdminDashboard => ({
	users: {
		activeByRole: {
			user: 12,
			reviewer: 2,
			admin: 1,
		},
		inactive: 3,
		mustChangePassword: 4,
		withoutAccess30Days: 5,
	},
	projects: {
		draft: 5,
		awaitingSubmission: 2,
		underReview: 3,
		rejected: 1,
	},
	queue: {
		unassigned: 4,
		dueIn3Days: 2,
		overdue: 1,
		byReviewer: [
			{
				id: "rev-1",
				name: "Ana Silva",
				active: true,
				underReview: 3,
			},
			{
				id: "rev-2",
				name: "Bruno Antigo",
				active: false,
				underReview: 1,
			},
		],
	},
	...overrides,
});

const renderPage = (searchParams = "") =>
	render(<AdminDashboardPage />, {
		wrapper: withNuqsTestingAdapter({ searchParams, hasMemory: true }),
	});

describe("AdminDashboardPage", () => {
	beforeEach(() => {
		state.dashboardQuery = loadedQuery({ data: makeAdminDashboard() });
		state.reviewQuery = loadedQuery({ data: reviewDashboardOf() });
		state.periods = [];
	});

	it("puts the queue on the green band, like every panel", () => {
		renderPage();

		const band = screen.getByRole("region", { name: "Fila de análise hoje" });
		for (const [label, value] of [
			["Em análise", "03"],
			["Sem analista", "04"],
			["Prazo até 3 dias", "02"],
			["Atrasados", "01"],
		]) {
			expect(within(band).getByText(label).nextSibling).toHaveTextContent(
				value,
			);
		}
	});

	it("lists the load per analyst, with the deactivated one marked", () => {
		renderPage();

		const load = screen.getByRole("region", { name: /Carga por Analista/ });
		expect(within(load).getByText("Ana Silva")).toBeInTheDocument();
		expect(within(load).getByText("03 projetos")).toBeInTheDocument();
		expect(
			within(load).getByText("Bruno Antigo (Inativo)"),
		).toBeInTheDocument();
	});

	it("links each user counter to the filtered list", () => {
		renderPage();

		const users = screen.getByRole("region", { name: "Usuários" });
		const designers = within(users).getByRole("link", {
			name: /projetistas ativos/i,
		});
		expect(designers).toHaveAttribute(
			"href",
			expect.stringContaining("role=user"),
		);
		expect(
			within(users).getByRole("link", { name: "Contas inativas" }),
		).toHaveAttribute("href", expect.stringContaining("status=inactive"));
	});

	it("lists what needs action, each with the list that resolves it", () => {
		renderPage();

		const actions = screen.getByRole("region", { name: "Exige Ação" });
		expect(
			within(actions).getByText("04 projetos sem analista"),
		).toBeInTheDocument();
		expect(
			within(actions).getByRole("link", { name: /Ver Projetos Sem Analista/ }),
		).toHaveAttribute("href", "/projetos?status=UNDER_REVIEW&reviewer=none");
		expect(
			within(actions).getByText("04 trocas de senha pendentes"),
		).toBeInTheDocument();
		expect(
			within(actions).getByText("05 contas sem acesso há mais de 30 dias"),
		).toBeInTheDocument();
	});

	it("leaves out what is already resolved", () => {
		state.dashboardQuery = loadedQuery({
			data: makeAdminDashboard({
				users: {
					activeByRole: { user: 1 },
					inactive: 0,
					mustChangePassword: 0,
					withoutAccess30Days: 0,
				},
				queue: { unassigned: 0, dueIn3Days: 0, overdue: 0, byReviewer: [] },
			}),
		});
		renderPage();

		expect(
			within(screen.getByRole("region", { name: "Exige Ação" })).getByText(
				"Nada exige sua ação agora.",
			),
		).toBeInTheDocument();
	});

	it("offers to retry when the panel fails", () => {
		state.dashboardQuery = { isError: true, refetch: vi.fn() };
		renderPage();

		expect(
			screen.getByText("Não foi possível carregar o painel"),
		).toBeInTheDocument();
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});

	it("adds the team's indicators of the period to the follow-up column", () => {
		renderPage();

		expect(
			within(
				screen.getByRole("region", { name: /Projetos no Período/ }),
			).getByText("Reprovados").nextSibling,
		).toHaveTextContent("09");
		expect(
			within(
				screen.getByRole("region", { name: /Apontamentos Mais Frequentes/ }),
			).getByText("12"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Tempos e Prazos" }),
		).toBeInTheDocument();
		// "Carga por Analista" already shows the load; the indicators do not repeat it.
		expect(
			screen.queryByRole("region", { name: /Em Análise por Analista/ }),
		).not.toBeInTheDocument();
	});

	it("asks the indicators for the period picked and keeps the queue of today", () => {
		renderPage("?period=LAST_90_DAYS");

		expect(state.periods.at(-1)).toBe("LAST_90_DAYS");

		fireEvent.click(screen.getByRole("button", { name: "Ano Corrente" }));

		expect(state.periods.at(-1)).toBe("CURRENT_YEAR");
		expect(
			screen.getByRole("region", { name: "Fila de análise hoje" }),
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
			screen.getByRole("region", { name: /Carga por Analista/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("region", { name: "Exige Ação" }),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));

		expect(refetch).toHaveBeenCalled();
	});
});
