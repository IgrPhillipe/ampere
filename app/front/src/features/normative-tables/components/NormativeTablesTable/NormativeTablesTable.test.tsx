import type {
	NormativeTable,
	NormativeTableListing,
} from "@services/normative-tables";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { NormativeTablesTable } from "./NormativeTablesTable";

const revision = (fields: Partial<NormativeTable>): NormativeTable => ({
	id: "1",
	standard: { name: "DIS-NOR-053", revision: "REV 06" },
	code: "Q37_SAFETY_FACTOR",
	title: "Fator de segurança",
	identification: "Quadro 37",
	item: "Anexo I, item 5",
	page: "108",
	version: 0,
	status: "PUBLISHED",
	rowCount: 4,
	registeredBy: "admin@ampere.com",
	registeredByName: "Ana Gestora",
	registeredAt: "2026-07-01T12:00:00Z",
	verifiedBy: "conferente@ampere.com",
	verifiedByName: "Bruno Conferente",
	verifiedAt: "2026-07-10T12:00:00Z",
	...fields,
});

const pendingDraft = revision({
	id: "2",
	status: "DRAFT",
	registeredBy: "revisor@ampere.com",
	registeredByName: "Rita Revisora",
	verifiedBy: null,
	verifiedByName: null,
	verifiedAt: null,
});

const line: NormativeTableListing = {
	...revision({}),
	revisionCount: 3,
	pendingRevision: pendingDraft,
};

describe("NormativeTablesTable", () => {
	it("offers to clear the filters when they leave no table", () => {
		const onClearFilters = vi.fn();
		render(
			<NormativeTablesTable
				tables={[]}
				onOpen={vi.fn()}
				onClearFilters={onClearFilters}
			/>,
		);

		expect(
			screen.getByText(
				"Nenhuma tabela encontrada para os critérios informados",
			),
		).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Limpar Filtros" }));

		expect(onClearFilters).toHaveBeenCalledOnce();
	});

	it("asks for the first table without filters", () => {
		render(<NormativeTablesTable tables={[]} onOpen={vi.fn()} />);

		expect(screen.getByText("Nenhuma tabela cadastrada")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Limpar Filtros" }),
		).not.toBeInTheDocument();
	});

	it("shows the published revision once and leads its review to the draft", () => {
		signInAs("reviewer");
		const onOpen = vi.fn();
		render(<NormativeTablesTable tables={[line]} onOpen={onOpen} />);

		expect(screen.getAllByText("Vigente")[0]).toBeVisible();
		expect(screen.getAllByText("Revisão Pendente")[0]).toBeVisible();
		expect(screen.getAllByText("03 revisões")[0]).toBeVisible();
		expect(screen.getByText(/Aguardando sua revisão/)).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Revisar" }));

		expect(onOpen).toHaveBeenCalledExactlyOnceWith(pendingDraft);
	});

	it("opens the line itself when nothing waits for review", () => {
		signInAs("reviewer");
		const onOpen = vi.fn();
		const published = { ...line, revisionCount: 1, pendingRevision: null };
		render(<NormativeTablesTable tables={[published]} onOpen={onOpen} />);

		expect(screen.queryByText("Revisão Pendente")).not.toBeInTheDocument();
		expect(screen.queryByText("01 revisão")).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Ver Tabela" }));

		expect(onOpen).toHaveBeenCalledExactlyOnceWith(published);
	});
});
