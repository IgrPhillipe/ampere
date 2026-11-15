import type { NormativeTable } from "@services/normative-tables";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { NormativeTableSheet } from "./NormativeTableSheet";

const table: NormativeTable = {
	id: "7",
	standard: { name: "DIS-NOR-053", revision: "REV 06" },
	code: "Q37_SAFETY_FACTOR",
	title: "Fator de segurança",
	identification: "Quadro 37",
	item: "Anexo I, item 5",
	page: "108",
	status: "PUBLISHED",
	rowCount: 1,
	registeredBy: "admin@ampere.com",
	registeredByName: "Ana Gestora",
	registeredAt: "2026-07-01T12:00:00Z",
	verifiedBy: "conferente@ampere.com",
	verifiedByName: "Bruno Conferente",
	verifiedAt: "2026-07-10T12:00:00Z",
	rows: [{ upperBound: 25, value: 1.5 }],
};

vi.mock("@services/normative-tables", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/normative-tables")>()),
	useGetNormativeTableCodes: () => ({ isPending: false, data: { data: [] } }),
	useGetNormativeTable: () => ({ isPending: false, data: { data: table } }),
	useGetNormativeTableRevisions: () => ({
		isPending: false,
		isError: false,
		data: { data: [table] },
	}),
}));

const renderSheet = (tableId: string | null) =>
	render(
		<QueryClientProvider client={new QueryClient()}>
			<NormativeTableSheet
				open
				tableId={tableId}
				onCreated={vi.fn()}
				onClose={vi.fn()}
			/>
		</QueryClientProvider>,
	);

describe("NormativeTableSheet", () => {
	it("shows the names in the metadata and opens the history tab", () => {
		signInAs("admin");
		renderSheet("7");

		expect(screen.getByText("Ana Gestora")).toBeVisible();
		expect(screen.getByText("Bruno Conferente")).toBeVisible();

		fireEvent.click(screen.getByRole("tab", { name: "Histórico" }));

		expect(screen.getByRole("region", { name: "Revisões" })).toBeVisible();
	});

	it("has no history while a new table is typed", () => {
		signInAs("admin");
		renderSheet(null);

		expect(
			screen.queryByRole("tab", { name: "Histórico" }),
		).not.toBeInTheDocument();
	});
});
