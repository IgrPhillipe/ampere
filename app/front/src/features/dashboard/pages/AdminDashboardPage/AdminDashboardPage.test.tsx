import type { AdminDashboard } from "@services/dashboard";
import { render, screen, within } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery } from "@/test/fixtures/project-detail";

import { AdminDashboardPage } from "./AdminDashboardPage";

const state = vi.hoisted(() => ({
	dashboardQuery: {} as Record<string, unknown>,
	projectsQuery: {} as Record<string, unknown>,
	ownersQuery: {} as Record<string, unknown>,
	projectParams: [] as unknown[],
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
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProjectList: (params: unknown) => {
		state.projectParams.push(params);

		return state.projectsQuery;
	},
	useGetProjectOwnerInfiniteList: () => state.ownersQuery,
	useDeleteProject: () => ({ mutate: vi.fn(), isPending: false }),
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
		municipalitiesWithoutReviewer: 7,
	},
	...overrides,
});

const renderPage = (searchParams = "") =>
	render(<AdminDashboardPage />, {
		wrapper: withNuqsTestingAdapter({ searchParams }),
	});

describe("AdminDashboardPage", () => {
	beforeEach(() => {
		state.dashboardQuery = loadedQuery({ data: makeAdminDashboard() });
		state.projectsQuery = loadedQuery({
			data: [],
			pagination: { page: 1, pageSize: 10, total: 0 },
		});
		state.ownersQuery = loadedQuery({
			pages: [{ data: [] }],
		});
		state.projectParams = [];
	});

	it("renders user counters with links containing the expected query parameters", () => {
		renderPage();

		const userLink = screen.getByRole("link", { name: /projetistas ativos/i });
		expect(userLink).toHaveAttribute(
			"href",
			expect.stringContaining("/usuarios"),
		);
		expect(userLink).toHaveAttribute(
			"href",
			expect.stringContaining("role=user"),
		);
		expect(userLink).toHaveAttribute(
			"href",
			expect.stringContaining("status=active"),
		);
		expect(within(userLink).getByText("12")).toBeInTheDocument();

		const reviewerLink = screen.getByRole("link", {
			name: /analistas ativos/i,
		});
		expect(reviewerLink).toHaveAttribute(
			"href",
			expect.stringContaining("role=reviewer"),
		);
		expect(reviewerLink).toHaveAttribute(
			"href",
			expect.stringContaining("status=active"),
		);
		expect(within(reviewerLink).getByText("02")).toBeInTheDocument();

		const adminLink = screen.getByRole("link", { name: /gestores ativos/i });
		expect(adminLink).toHaveAttribute(
			"href",
			expect.stringContaining("role=admin"),
		);
		expect(adminLink).toHaveAttribute(
			"href",
			expect.stringContaining("status=active"),
		);
		expect(within(adminLink).getByText("01")).toBeInTheDocument();

		const inactiveLink = screen.getByRole("link", { name: /contas inativas/i });
		expect(inactiveLink).toHaveAttribute(
			"href",
			expect.stringContaining("status=inactive"),
		);
		expect(within(inactiveLink).getByText("03")).toBeInTheDocument();

		const mustChangePwdLink = screen.getByRole("link", {
			name: /troca de senha pendente/i,
		});
		expect(mustChangePwdLink).toHaveAttribute(
			"href",
			expect.stringContaining("mustChangePassword=true"),
		);
		expect(within(mustChangePwdLink).getByText("04")).toBeInTheDocument();

		const inactive30DaysLink = screen.getByRole("link", {
			name: /sem acesso há mais de 30 dias/i,
		});
		expect(inactive30DaysLink).toHaveAttribute(
			"href",
			expect.stringContaining("status=active"),
		);
		expect(inactive30DaysLink).toHaveAttribute(
			"href",
			expect.stringContaining("inactiveDays=30"),
		);
		expect(within(inactive30DaysLink).getByText("05")).toBeInTheDocument();
	});

	it("renders queue indicators, reviewer load, and shortcuts to review queue and distribution", () => {
		renderPage();

		const queueSection = screen.getByRole("region", {
			name: /fila de análise/i,
		});

		// Shortcuts
		const queueLink = within(queueSection).getByRole("link", {
			name: /ir para fila/i,
		});
		expect(queueLink).toHaveAttribute("href", "/fila-de-analise");

		const distLink = within(queueSection).getByRole("link", {
			name: /distribuição/i,
		});
		expect(distLink).toHaveAttribute("href", "/distribuicao");

		// Queue counts
		expect(within(queueSection).getByText("04")).toBeInTheDocument(); // unassigned
		expect(within(queueSection).getByText("02")).toBeInTheDocument(); // dueIn3Days
		expect(
			within(queueSection).getAllByText("01").length,
		).toBeGreaterThanOrEqual(1); // overdue and Bruno's underReview
		expect(within(queueSection).getByText("07")).toBeInTheDocument(); // municipalitiesWithoutReviewer

		// Reviewers workload
		expect(within(queueSection).getByText("Ana Silva")).toBeInTheDocument();
		expect(within(queueSection).getByText("Bruno Antigo")).toBeInTheDocument();
		expect(within(queueSection).getByText("Inativo")).toBeInTheDocument();
	});

	it("lists the active projects of every designer, filtered from the URL", () => {
		renderPage("?search=PRJ-0001&owner=5");

		expect(
			screen.getByRole("heading", { name: /projetos ativos/i }),
		).toBeInTheDocument();
		expect(screen.getByRole("searchbox")).toHaveValue("PRJ-0001");
		expect(state.projectParams.at(-1)).toMatchObject({
			status: ["DRAFT", "AWAITING_SUBMISSION", "UNDER_REVIEW", "REJECTED"],
			owner: "5",
			pageSize: 10,
		});
	});

	it("keeps the projects table when the counters fail", () => {
		state.dashboardQuery = { isError: true, refetch: vi.fn() };
		renderPage();

		expect(
			screen.getByText("Não foi possível carregar os indicadores"),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("region", { name: /fila de análise/i }),
		).not.toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: /projetos ativos/i }),
		).toBeInTheDocument();
	});
});
