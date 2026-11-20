import type { ReviewQueueItem } from "@services/review-queue";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
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
		data: {
			data: [
				{ id: "7", name: "Ana Analista" },
				{ id: "8", name: "Bruno Analista" },
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

vi.mock("@services/reviewer-distribution", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/reviewer-distribution")>()),
	useAssignReviewQueue: () => ({ mutate: mockAssign, isPending: false }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	useNavigate: () => mockNavigate,
}));

const renderPage = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<NuqsTestingAdapter>
				<ReviewQueuePage />
			</NuqsTestingAdapter>
		</QueryClientProvider>,
	);

const select = (protocol: string) =>
	fireEvent.click(
		screen.getByRole("checkbox", { name: `Selecionar o projeto ${protocol}` }),
	);

const assignTo = async (name: string) => {
	fireEvent.click(screen.getByRole("button", { name: "Atribuir Analista" }));
	const dialog = await screen.findByRole("dialog");
	fireEvent.click(within(dialog).getByRole("combobox", { name: "Analista" }));
	const option = await screen.findByRole("option", { name });
	fireEvent.pointerDown(option);
	fireEvent.click(option);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
	fireEvent.click(within(dialog).getByRole("button", { name: "Atribuir" }));

	return dialog;
};

describe("ReviewQueuePage batch assignment", () => {
	beforeEach(() => {
		mockAssign.mockReset();
		mockNavigate.mockReset();
	});

	it("keeps the selection away from the analyst", () => {
		signInAs("reviewer", { id: "7" });
		renderPage();

		expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
		expect(
			screen.queryByRole("button", { name: "Atribuir Analista" }),
		).not.toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: "Analisar" })).toHaveLength(1);
		expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeEnabled();
	});

	it("assigns the selected projects and clears the selection", async () => {
		signInAs("admin", { id: "1" });
		mockAssign.mockImplementation((_payload, options) => options.onSuccess());
		renderPage();

		expect(
			screen.queryByRole("button", { name: "Atribuir Analista" }),
		).not.toBeInTheDocument();
		select("2026-0001");
		select("2026-0003");
		expect(screen.getByText("2 projetos selecionados")).toBeInTheDocument();

		await assignTo("Bruno Analista");

		expect(mockAssign).toHaveBeenCalledWith(
			{ projectIds: ["1", "3"], reviewerId: "8" },
			expect.anything(),
		);
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(screen.queryByText(/selecionados?$/)).not.toBeInTheDocument();
	});

	it("keeps the dialog and the selection when the API refuses", async () => {
		signInAs("admin", { id: "1" });
		// The hook toasts the refusal; the page only must not move on.
		mockAssign.mockImplementation((_payload, options) =>
			options.onError?.(new Error("Analista inativo.")),
		);
		renderPage();

		select("2026-0001");
		select("2026-0002");
		const dialog = await assignTo("Ana Analista");

		expect(mockAssign).toHaveBeenCalledOnce();
		expect(dialog).toBeInTheDocument();
		expect(screen.getByText("2 projetos selecionados")).toBeInTheDocument();
	});

	it("drops the selection with Limpar Seleção", () => {
		signInAs("admin", { id: "1" });
		renderPage();

		select("2026-0002");
		fireEvent.click(screen.getByRole("button", { name: "Limpar Seleção" }));

		expect(
			screen.getByRole("checkbox", { name: "Selecionar o projeto 2026-0002" }),
		).toHaveAttribute("aria-checked", "false");
		expect(
			screen.queryByRole("button", { name: "Atribuir Analista" }),
		).not.toBeInTheDocument();
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
