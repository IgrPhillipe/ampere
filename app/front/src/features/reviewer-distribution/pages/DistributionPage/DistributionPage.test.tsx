import { CONCESSION_MUNICIPALITIES } from "@services/locations";
import type { ReviewerDistribution } from "@services/reviewer-distribution";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { DistributionPage } from "./DistributionPage";

const mockUpdate = vi.fn();
const mockRefetch = vi.fn();
const listQuery = vi.hoisted(() => ({
	current: {} as Record<string, unknown>,
}));

vi.mock("@services/reviewer-distribution", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/reviewer-distribution")>()),
	useGetReviewerDistribution: () => listQuery.current,
	useUpdateReviewerMunicipalities: () => ({
		mutate: mockUpdate,
		isPending: false,
	}),
}));

const distribution: ReviewerDistribution[] = [
	{
		reviewer: { id: "7", name: "Ana Analista" },
		municipalities: [
			{ state: "PE", municipality: "Gravatá" },
			{ state: "PE", municipality: "Caruaru" },
		],
	},
	{ reviewer: { id: "8", name: "Bruno Analista" }, municipalities: [] },
];

const loaded = (data: ReviewerDistribution[]) => ({
	isPending: false,
	isError: false,
	refetch: mockRefetch,
	data: { data },
});

const renderPage = () =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<DistributionPage />
		</QueryClientProvider>,
	);

const rowOf = (name: string) => {
	const row = screen.getByText(name).closest("tr");
	if (!row) throw new Error(`No row for ${name}`);
	return within(row);
};

const removeAndSave = async (label: string) => {
	fireEvent.click(
		screen.getByRole("button", { name: "Editar municípios de Ana Analista" }),
	);
	const dialog = await screen.findByRole("dialog");
	fireEvent.click(
		within(dialog).getByRole("button", { name: `Remover ${label}` }),
	);
	fireEvent.click(
		within(dialog).getByRole("button", { name: "Salvar Municípios" }),
	);

	return dialog;
};

describe("DistributionPage", () => {
	beforeEach(() => {
		signInAs("admin");
		mockUpdate.mockReset();
		mockRefetch.mockReset();
		listQuery.current = loaded(distribution);
	});

	it("lists each analyst with their municipalities, by name", () => {
		renderPage();

		expect(
			rowOf("Ana Analista").getByText("Caruaru/PE; Gravatá/PE"),
		).toBeInTheDocument();
		expect(rowOf("Ana Analista").getByText("2")).toBeInTheDocument();
		expect(
			rowOf("Bruno Analista").getByText("Nenhum município"),
		).toBeInTheDocument();
	});

	it("highlights the concession municipalities without an analyst", () => {
		renderPage();

		const unassigned = screen.getByRole("list", {
			name: "Municípios da área de concessão sem analista",
		});
		expect(
			within(unassigned).queryByText("Caruaru/PE"),
		).not.toBeInTheDocument();
		expect(within(unassigned).getByText("Abreu e Lima/PE")).toBeInTheDocument();
		expect(
			screen.getByText(`${CONCESSION_MUNICIPALITIES.length - 2} sem analista`),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: /Mostrar Todos/ }));
		expect(within(unassigned).getByText("Recife/PE")).toBeInTheDocument();
		expect(
			within(unassigned).getByText("Pedras de Fogo/PB"),
		).toBeInTheDocument();
	});

	it("saves the analyst's new list and closes the dialog", async () => {
		mockUpdate.mockImplementation((_params, options) => options.onSuccess());
		renderPage();

		await removeAndSave("Gravatá/PE");

		expect(mockUpdate).toHaveBeenCalledWith(
			{
				reviewerId: "7",
				municipalities: [{ state: "PE", municipality: "Caruaru" }],
			},
			expect.anything(),
		);
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
	});

	it("keeps the dialog open when the API refuses a municipality", async () => {
		// The hook toasts the 409; the edit must survive for a second try.
		mockUpdate.mockImplementation((_params, options) =>
			options.onError?.(new Error("conflict")),
		);
		renderPage();

		const dialog = await removeAndSave("Caruaru/PE");

		expect(mockUpdate).toHaveBeenCalledOnce();
		expect(dialog).toBeInTheDocument();
		expect(within(dialog).queryByText("Caruaru/PE")).not.toBeInTheDocument();
		expect(within(dialog).getByText("Gravatá/PE")).toBeInTheDocument();
	});

	it("says when every municipality has an analyst", () => {
		listQuery.current = loaded([
			{
				reviewer: { id: "7", name: "Ana Analista" },
				municipalities: CONCESSION_MUNICIPALITIES.map(({ state, name }) => ({
					state,
					municipality: name,
				})),
			},
		]);
		renderPage();

		expect(
			screen.getByText(
				"Todos os municípios da área de concessão têm um analista.",
			),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("list", {
				name: "Municípios da área de concessão sem analista",
			}),
		).not.toBeInTheDocument();
	});

	it("offers a retry when the list fails", () => {
		listQuery.current = {
			isPending: false,
			isError: true,
			refetch: mockRefetch,
		};
		renderPage();

		fireEvent.click(screen.getByRole("button", { name: "Tentar Novamente" }));
		expect(mockRefetch).toHaveBeenCalledOnce();
	});

	it("tells when there is no active analyst", () => {
		listQuery.current = loaded([]);
		renderPage();

		expect(screen.getByText("Nenhum analista ativo")).toBeInTheDocument();
	});
});
