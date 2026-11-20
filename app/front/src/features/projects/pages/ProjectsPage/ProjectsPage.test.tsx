import type { Project } from "@services/projects";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { ProjectsPage } from "./ProjectsPage";

const state = vi.hoisted(() => ({ total: 3 }));
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

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProjectList: () => ({
		isPending: false,
		isError: false,
		isPlaceholderData: false,
		data: {
			data: [] as Project[],
			pagination: { total: state.total, page: 1, pageSize: 10 },
		},
	}),
	useGetProjectStatusCounts: () => ({ isError: false, data: undefined }),
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
	...(await importOriginal<typeof import("@tanstack/react-router")>()),
	useNavigate: () => vi.fn(),
}));

const renderPage = (searchParams: string) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<NuqsTestingAdapter searchParams={searchParams}>
				<ProjectsPage />
			</NuqsTestingAdapter>
		</QueryClientProvider>,
	);

describe("ProjectsPage export", () => {
	let requestUrl = "";
	let respond: (response: Response) => void = vi.fn();

	beforeEach(() => {
		requestUrl = "";
		state.total = 3;
		mockDownload.mockReset();
		mockToastError.mockReset();
		signInAs("user", { id: "1" });
		vi.stubGlobal(
			"fetch",
			vi.fn(
				(request: Request) =>
					new Promise<Response>((resolve) => {
						requestUrl = request.url;
						respond = resolve;
					}),
			),
		);
	});
	afterEach(() => vi.unstubAllGlobals());

	const exportButton = () =>
		screen.getByRole("button", { name: /Exportar CSV|Exportando/ });

	it("downloads the filtered and sorted projects without pagination", async () => {
		renderPage(
			"?status=REJECTED&state=PE&sort=name&direction=ASC&page=2&search=Recife",
		);

		fireEvent.click(exportButton());

		await waitFor(() =>
			expect(exportButton()).toHaveTextContent("Exportando..."),
		);
		const url = new URL(requestUrl);
		expect(url.pathname).toBe("/api/projects/export.csv");
		expect(url.searchParams.getAll("status")).toEqual(["REJECTED"]);
		expect(url.searchParams.getAll("state")).toEqual(["PE"]);
		expect(url.searchParams.get("search")).toBe("Recife");
		expect(url.searchParams.get("sort")).toBe("name");
		expect(url.searchParams.get("direction")).toBe("ASC");
		expect(url.searchParams.has("page")).toBe(false);
		expect(url.searchParams.has("pageSize")).toBe(false);

		respond(
			new Response("Protocolo;Projeto", {
				headers: {
					"Content-Disposition":
						'attachment; filename="projetos-2026-11-20.csv"',
				},
			}),
		);

		await waitFor(() => expect(mockDownload).toHaveBeenCalledOnce());
		const [blob, filename] = mockDownload.mock.calls[0];
		expect(filename).toBe("projetos-2026-11-20.csv");
		expect(await (blob as Blob).text()).toBe("Protocolo;Projeto");
		expect(exportButton()).toHaveTextContent("Exportar CSV");
		expect(mockToastError).not.toHaveBeenCalled();
	});

	it("shows the API reason when the export fails", async () => {
		renderPage("");

		fireEvent.click(exportButton());
		await waitFor(() => expect(requestUrl).not.toBe(""));
		respond(
			Response.json(
				{
					status: 403,
					title: "Forbidden",
					detail: "Você não tem acesso a estes projetos.",
				},
				{
					status: 403,
					headers: { "Content-Type": "application/problem+json" },
				},
			),
		);

		await waitFor(() =>
			expect(mockToastError).toHaveBeenCalledWith(
				"Você não tem acesso a estes projetos.",
			),
		);
		expect(mockDownload).not.toHaveBeenCalled();
		expect(exportButton()).toHaveTextContent("Exportar CSV");
	});

	it("keeps the export off when the filters match no project", () => {
		state.total = 0;
		renderPage("?search=inexistente");

		expect(exportButton()).toBeDisabled();
	});
});
