import type {
	ListMyReviewsParams,
	MyReviewItem,
	MyReviewListResponse,
} from "@services/review-queue";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadedQuery } from "@/test/fixtures/project-detail";

import { MyReviewsPage } from "./MyReviewsPage";

const state = vi.hoisted(() => ({
	query: {} as Record<string, unknown>,
	params: [] as ListMyReviewsParams[],
	navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => state.navigate,
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

vi.mock("@services/review-queue", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/review-queue")>()),
	useGetMyReviews: (params: ListMyReviewsParams) => {
		state.params.push(params);

		return state.query;
	},
}));

const reviewOf = (
	id: string,
	overrides: Partial<MyReviewItem> = {},
): MyReviewItem => ({
	id,
	name: `Edifício ${id}`,
	protocol: `2026-04${id}`,
	municipality: "Recife",
	state: "PE",
	ownerName: "Carla Projetista",
	decision: "APPROVED",
	decidedAt: "2026-11-10T14:00:00-03:00",
	findings: 0,
	version: 1,
	currentVersion: 1,
	consumerUnitsCount: 24,
	demandKva: 86.4,
	...overrides,
});

const responseOf = (items: MyReviewItem[]): MyReviewListResponse => ({
	data: items,
	pagination: { total: items.length, page: 1, pageSize: 10 },
	counts: { all: 12, approved: 9, rejected: 3 },
});

const renderPage = (searchParams = "") =>
	render(<MyReviewsPage />, {
		wrapper: withNuqsTestingAdapter({ searchParams, hasMemory: true }),
	});

describe("MyReviewsPage", () => {
	beforeEach(() => {
		state.params = [];
		state.navigate.mockReset();
		state.query = loadedQuery(
			responseOf([
				reviewOf("81"),
				reviewOf("82", { decision: "REJECTED", findings: 4, version: 2 }),
			]),
		);
	});

	it("lists each decision with its findings, version and date", () => {
		renderPage();

		const row = screen.getByRole("row", { name: /Edifício 82/ });

		expect(within(row).getByText("2026-0482")).toBeInTheDocument();
		expect(within(row).getByText("Reprovado")).toBeInTheDocument();
		expect(within(row).getByText("04")).toBeInTheDocument();
		expect(within(row).getByText("v02")).toBeInTheDocument();
		expect(within(row).getByText("10/11/2026")).toBeInTheDocument();
	});

	it("counts each decision on its chip", () => {
		renderPage();

		const chips = screen.getByRole("group", {
			name: "Filtrar pareceres por decisão",
		});

		expect(
			within(chips).getByRole("button", { name: /Todos\s*12/ }),
		).toHaveAttribute("aria-pressed", "true");
		expect(
			within(chips).getByRole("button", { name: /Reprovados\s*03/ }),
		).toBeInTheDocument();
	});

	it("asks only for the rejections once the analyst picks Reprovados", () => {
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: /Reprovados/ }));

		expect(state.params.at(-1)).toMatchObject({
			decision: "REJECTED",
			page: 1,
			pageSize: 10,
		});
		expect(screen.getByRole("button", { name: /Reprovados/ })).toHaveAttribute(
			"aria-pressed",
			"true",
		);
	});

	it("reads the decision from the URL and leaves Todos out of the request", () => {
		renderPage("?decision=APPROVED");

		expect(state.params.at(-1)?.decision).toBe("APPROVED");

		fireEvent.click(screen.getByRole("button", { name: /Todos/ }));

		expect(state.params.at(-1)?.decision).toBeUndefined();
	});

	it("opens the analysis in consultation from the row and from the name", () => {
		renderPage();

		fireEvent.click(screen.getByRole("row", { name: /Edifício 81/ }));

		expect(state.navigate).toHaveBeenCalledWith({
			to: "/projetos/$id",
			params: { id: "81" },
		});
		expect(screen.getByRole("link", { name: "Edifício 82" })).toHaveAttribute(
			"href",
			"/projetos/82",
		);
	});

	it("opens the history for a decision on an older submission", () => {
		state.query = loadedQuery(
			responseOf([reviewOf("83", { version: 1, currentVersion: 2 })]),
		);
		renderPage();

		fireEvent.click(screen.getByRole("row", { name: /Edifício 83/ }));

		expect(state.navigate).toHaveBeenCalledWith({
			to: "/projetos/$id/historico",
			params: { id: "83" },
		});
		expect(screen.getByRole("link", { name: "Edifício 83" })).toHaveAttribute(
			"href",
			"/projetos/83/historico",
		);
	});

	it("offers to clear the filters when they hide every decision", () => {
		state.query = loadedQuery(responseOf([]));
		renderPage("?decision=REJECTED");

		expect(
			screen.getByText(
				"Nenhum parecer encontrado para os critérios informados",
			),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Limpar Filtros" }));

		expect(state.params.at(-1)?.decision).toBeUndefined();
	});

	it("explains the empty list before the first decision", () => {
		state.query = loadedQuery(responseOf([]));
		renderPage();

		expect(
			screen.getByText("Nenhum parecer emitido ainda"),
		).toBeInTheDocument();
	});

	it("offers a retry when the list fails", () => {
		const refetch = vi.fn();
		state.query = { isError: true, isPending: false, refetch };
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));

		expect(refetch).toHaveBeenCalled();
	});
});
