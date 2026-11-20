import type { ReviewQueueItem } from "@services/review-queue";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { ReviewQueuePage } from "./ReviewQueuePage";

const mockAssign = vi.fn();
const mockNavigate = vi.fn();
const mockDownload = vi.fn();
const mockToastError = vi.fn();

vi.mock("@lib/http", async () => {
	const { filenameOf, http } =
		await vi.importActual<typeof import("@lib/http")>("@lib/http");

	return { filenameOf, http: http.extend({ prefix: "http://localhost/api" }) };
});

vi.mock("@features/shared", async (importOriginal) => ({
	...(await importOriginal<typeof import("@features/shared")>()),
	downloadFile: (...args: unknown[]) => mockDownload(...args),
}));

vi.mock("sonner", async (importOriginal) => {
	const sonner = await importOriginal<typeof import("sonner")>();

	return {
		...sonner,
		toast: Object.assign(sonner.toast, {
			error: (...args: unknown[]) => mockToastError(...args),
		}),
	};
});

const itemOf = (id: string, reviewerName: string | null = null) =>
	({
		id,
		name: `Projeto ${id}`,
		protocol: `2026-000${id}`,
		municipality: "Caruaru",
		state: "PE",
		submittedAt: "2026-09-08T12:00:00Z",
		deadline: "2026-10-08",
		deadlineStatus: "ON_TIME",
		daysRemaining: 20,
		warnings: 0,
		alerts: [],
		ownerId: "3",
		ownerName: "João Projetista",
		consumerUnitsCount: 4,
		demandKva: 30,
		reanalysis: false,
		reviewCycle: 1,
		reviewerId: reviewerName ? "7" : null,
		reviewerName,
	}) satisfies ReviewQueueItem;

const items = [itemOf("1"), itemOf("2"), itemOf("3", "Ana Analista")];

vi.mock("@services/review-queue", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/review-queue")>()),
	useGetReviewQueue: () => ({
		isPending: false,
		isError: false,
		isPlaceholderData: false,
		data: { data: items, pagination: { total: 3, page: 1, pageSize: 10 } },
	}),
	useGetReviewQueueIndicators: () => ({ isError: false, data: undefined }),
	useGetReviewerList: () => ({
		isPending: false,
		isSuccess: true,
		data: {
			data: [
				{ id: "7", name: "Ana Analista", role: "reviewer", active: true },
				{ id: "8", name: "Bruno Analista", role: "reviewer", active: true },
				{ id: "9", name: "Davi Analista", role: "reviewer", active: false },
			],
		},
	}),
	useGetQueueOwnerInfiniteList: () => ({
		isPending: false,
		data: { pages: [] },
		hasNextPage: false,
		isFetchingNextPage: false,
	}),
}));

vi.mock("@services/review-assignment", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/review-assignment")>()),
	useAssignReviewQueue: () => ({ mutate: mockAssign, isPending: false }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	useNavigate: () => mockNavigate,
}));

const renderPage = (searchParams = "", onUrlUpdate = vi.fn()) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate}>
				<ReviewQueuePage />
			</NuqsTestingAdapter>
		</QueryClientProvider>,
	);

describe("ReviewQueuePage roles", () => {
	beforeEach(() => {
		mockAssign.mockReset();
		mockNavigate.mockReset();
	});

	it("offers no batch selection", () => {
		signInAs("reviewer", { id: "7" });
		renderPage();

		expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
		expect(
			screen.queryByRole("button", { name: "Atribuir Analista" }),
		).not.toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "Analisar" })).toHaveLength(1);
		expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeEnabled();
	});

	it("leaves the reviewer filter and column to the manager", () => {
		signInAs("reviewer", { id: "7" });
		const { unmount } = renderPage();

		expect(
			screen.getByText("Acompanhe e priorize os projetos atribuídos a você."),
		).toBeInTheDocument();
		expect(screen.getByText("Meus projetos")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: /^Analista/ }),
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole("columnheader", { name: "Analista Responsável" }),
		).not.toBeInTheDocument();
		unmount();

		signInAs("admin", { id: "1" });
		renderPage();

		expect(screen.getByText("Todos na fila")).toBeInTheDocument();
		expect(
			screen.getByRole("columnheader", { name: "Analista Responsável" }),
		).toBeInTheDocument();
	});

	it("lets the manager filter by a deactivated analyst", async () => {
		signInAs("admin", { id: "1" });
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Analista: Todos" }));
		expect(
			await screen.findByRole("menuitemradio", {
				name: "Davi Analista (Inativo)",
			}),
		).toBeInTheDocument();
		fireEvent.keyDown(document.activeElement ?? document.body, {
			key: "Escape",
		});
	});

	it("drops the analyst filter once that analyst leaves the list", async () => {
		signInAs("admin", { id: "1" });
		const onUrlUpdate = vi.fn();
		renderPage("?reviewer=99", onUrlUpdate);

		await waitFor(() =>
			expect(
				onUrlUpdate.mock.lastCall?.[0]?.searchParams.get("reviewer"),
			).toBeNull(),
		);
	});

	it("keeps the filter on a deactivated analyst still in the list", () => {
		signInAs("admin", { id: "1" });
		const onUrlUpdate = vi.fn();
		renderPage("?reviewer=9", onUrlUpdate);

		expect(onUrlUpdate).not.toHaveBeenCalled();
		expect(
			screen.getByRole("button", { name: "Analista: Davi Analista (Inativo)" }),
		).toBeInTheDocument();
	});
});

describe("ReviewQueuePage export", () => {
	let requestUrl = "";

	const respondWith = (response: Response) =>
		vi.stubGlobal(
			"fetch",
			vi.fn(async (request: Request) => {
				requestUrl = request.url;
				return response;
			}),
		);

	beforeEach(() => {
		requestUrl = "";
		mockDownload.mockReset();
		mockToastError.mockReset();
		signInAs("reviewer", { id: "7" });
	});
	afterEach(() => vi.unstubAllGlobals());

	it("downloads the queue as shown on screen", async () => {
		respondWith(
			new Response("Protocolo;Projeto", {
				headers: {
					"Content-Disposition":
						'attachment; filename="fila-analise-2026-11-20.csv"',
				},
			}),
		);
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));

		await waitFor(() => expect(mockDownload).toHaveBeenCalledOnce());
		const [blob, filename] = mockDownload.mock.calls[0];
		expect(filename).toBe("fila-analise-2026-11-20.csv");
		expect(await (blob as Blob).text()).toBe("Protocolo;Projeto");
		expect(new URL(requestUrl).pathname).toBe("/api/review-queue/export.csv");
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it("shows the API reason when the export fails", async () => {
		respondWith(
			Response.json(
				{
					status: 403,
					title: "Forbidden",
					detail: "Apenas analista e administrador acessam a fila.",
				},
				{
					status: 403,
					headers: { "Content-Type": "application/problem+json" },
				},
			),
		);
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));

		await waitFor(() =>
			expect(mockToastError).toHaveBeenCalledWith(
				"Apenas analista e administrador acessam a fila.",
			),
		);
		expect(mockDownload).not.toHaveBeenCalled();
	});
});
