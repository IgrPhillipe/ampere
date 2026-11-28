import type {
	NormativeTable,
	NormativeTableListing,
} from "@services/normative-tables";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { NormativeTablesPage } from "./NormativeTablesPage";

const revision = (fields: Partial<NormativeTable>): NormativeTable => ({
	id: "2",
	standard: { name: "DIS-NOR-053", revision: "REV 06" },
	code: "Q35_APARTMENT_DEMAND",
	title: "Demanda do apartamento",
	identification: "Quadro 35",
	item: "Anexo I, item 1",
	page: "107",
	version: 0,
	status: "PUBLISHED",
	rowCount: 1,
	registeredBy: "admin@ampere.com",
	registeredByName: "Ana Gestora",
	registeredAt: "2026-07-01T12:00:00Z",
	verifiedBy: "conferente@ampere.com",
	verifiedByName: "Bruno Conferente",
	verifiedAt: "2026-07-10T12:00:00Z",
	rows: [{ upperBound: 40, value: 1 }],
	...fields,
});

const current = revision({});
const replaced = revision({
	id: "1",
	status: "SUPERSEDED",
	verifiedAt: "2026-03-10T12:00:00Z",
	supersededAt: "2026-07-10T12:00:00Z",
	rows: [{ upperBound: 40, value: 0.9 }],
});
const line: NormativeTableListing = {
	...current,
	revisionCount: 2,
	pendingRevision: null,
};

const hooks = vi.hoisted(() => ({ table: vi.fn() }));

vi.mock("@services/normative-tables", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/normative-tables")>()),
	useGetNormativeTableList: () => ({
		isPending: false,
		isError: false,
		data: { data: [line] },
	}),
	useGetNormativeTableCodes: () => ({ isPending: false, data: { data: [] } }),
	useGetNormativeTable: hooks.table,
	useGetNormativeTableRevisions: () => ({
		isPending: false,
		isError: false,
		data: { data: [current, replaced] },
	}),
	useCompareNormativeTableRevisions: () => ({
		isError: false,
		data: {
			data: {
				from: replaced,
				to: current,
				changed: [],
				included: [],
				removed: [],
			},
		},
	}),
}));

describe("NormativeTablesPage history", () => {
	it("loads a superseded revision read-only in the sheet", () => {
		hooks.table.mockImplementation((id: string) => ({
			isPending: false,
			isError: false,
			data: { data: id === "1" ? replaced : current },
		}));
		signInAs("reviewer");
		render(
			<QueryClientProvider client={new QueryClient()}>
				<NuqsTestingAdapter>
					<NormativeTablesPage />
				</NuqsTestingAdapter>
			</QueryClientProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Ver Tabela" }));
		fireEvent.click(screen.getByRole("tab", { name: "Histórico" }));
		fireEvent.click(screen.getByRole("button", { name: "Abrir Revisão 01" }));

		const sheet = within(screen.getByRole("dialog"));

		expect(hooks.table).toHaveBeenLastCalledWith("1", expect.anything());
		expect(sheet.getByRole("tab", { name: "Tabela" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(sheet.getByText("Substituída")).toBeVisible();
		expect(sheet.getByRole("group")).toBeDisabled();
	});
});
