import type {
	NormativeTable,
	NormativeTableCode,
	NormativeTableComparison,
} from "@services/normative-tables";
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NormativeTableHistory } from "./NormativeTableHistory";

const quadro37: NormativeTableCode = {
	code: "Q37_SAFETY_FACTOR",
	standard: "DIS-NOR-053",
	identification: "Quadro 37",
	title: "Fator de segurança",
	item: "Anexo I, item 5",
	page: "108",
	keys: [],
	argumentLabel: "Demanda (kVA)",
	valueLabels: ["Fator de segurança"],
};

const revision = (
	id: string,
	registeredAt: string,
	fields: Partial<NormativeTable> = {},
): NormativeTable => ({
	id,
	standard: { name: "DIS-NOR-053", revision: "REV 06" },
	code: "Q37_SAFETY_FACTOR",
	title: "Fator de segurança",
	identification: "Quadro 37",
	item: "Anexo I, item 5",
	page: "108",
	version: 0,
	status: "DRAFT",
	rowCount: 4,
	registeredBy: "admin@ampere.com",
	registeredByName: "Ana Gestora",
	registeredAt,
	...fields,
});

const older = revision("1", "2026-07-01T12:00:00Z", {
	status: "PUBLISHED",
	rowCount: 3,
	verifiedBy: "conferente@ampere.com",
	verifiedByName: "Bruno Conferente",
	verifiedAt: "2026-07-10T12:00:00Z",
});
const newer = revision("2", "2026-11-12T12:00:00Z");

const tabela2: NormativeTableCode = {
	...quadro37,
	code: "T2_SERVICE_ENTRANCE_380_220",
	identification: "Tabela 2",
	valueLabels: ["Categoria", "Condutor (mm²)", "Disjuntor geral (A)"],
};

const latest = revision("3", "2026-11-14T12:00:00Z");

const comparison: NormativeTableComparison = {
	from: older,
	to: newer,
	changed: [
		{
			before: { upperBound: 25, value: 1.5 },
			after: { upperBound: 25, value: 1.4 },
		},
	],
	included: [{ lowerBound: 100, value: 1.1 }],
	removed: [{ lowerBound: 50, value: 1.2 }],
};

const hooks = vi.hoisted(() => ({
	revisions: vi.fn(),
	compare: vi.fn(),
}));

vi.mock("@services/normative-tables", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/normative-tables")>()),
	useGetNormativeTableRevisions: hooks.revisions,
	useCompareNormativeTableRevisions: hooks.compare,
}));

const pick = async (picker: string, option: string) => {
	fireEvent.click(screen.getByRole("combobox", { name: picker }));
	const item = await screen.findByRole("option", { name: option });
	fireEvent.pointerDown(item);
	fireEvent.click(item);
	await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
};

const revisionsReturn = (data: NormativeTable[]) => ({
	isPending: false,
	isError: false,
	data: { data },
});

describe("NormativeTableHistory", () => {
	beforeEach(() => {
		hooks.revisions.mockReturnValue(revisionsReturn([newer, older]));
		hooks.compare.mockReturnValue({
			isError: false,
			data: { data: comparison },
		});
	});

	it("lists every revision with who registered and who approved it", () => {
		render(<NormativeTableHistory table={newer} definition={quadro37} />);

		const list = within(screen.getByRole("region", { name: "Revisões" }));
		const rows = list.getAllByRole("listitem");

		expect(rows).toHaveLength(2);
		expect(rows[0]).toHaveAttribute("aria-current", "true");
		expect(within(rows[0]).getByText("Revisão 02")).toBeVisible();
		expect(within(rows[1]).getByText("Revisão 01")).toBeVisible();
		expect(within(rows[0]).getByText("Aguardando Revisão")).toBeVisible();
		expect(within(rows[0]).getByText("Pendente")).toBeVisible();
		expect(within(rows[1]).getByText("Vigente")).toBeVisible();
		expect(within(rows[1]).getByText(/Bruno Conferente/)).toBeVisible();
		expect(list.getAllByText(/Ana Gestora/)).toHaveLength(2);
		expect(screen.getByText("02 revisões")).toBeVisible();
		expect(
			screen.getByText("01 alterada, 01 incluída, 01 removida"),
		).toBeVisible();
	});

	it("compares the open revision with the one before it", () => {
		render(<NormativeTableHistory table={newer} definition={quadro37} />);

		expect(hooks.compare).toHaveBeenCalledWith({ id: "2", from: "1", to: "2" });

		const table = screen.getByRole("table");
		const [, changed, included, removed] = within(table).getAllByRole("row");

		expect(within(changed).getByText("até 25")).toBeVisible();
		expect(within(changed).getByText("1,5")).not.toHaveClass(
			"text-faint-foreground",
		);
		expect(within(changed).getByText("1,4")).toBeVisible();
		expect(within(changed).getByText("Alterada")).toBeVisible();
		expect(within(included).getByText("acima de 100")).toBeVisible();
		expect(within(included).getByText("Não consta")).toBeVisible();
		expect(within(included).getByText("Incluída")).toBeVisible();
		expect(within(removed).getByText("acima de 50")).toBeVisible();
		expect(within(removed).getByText("Removida")).toBeVisible();
	});

	it("compares the first revision with the next one", () => {
		render(<NormativeTableHistory table={older} definition={quadro37} />);

		expect(hooks.compare).toHaveBeenCalledWith({ id: "1", from: "1", to: "2" });
	});

	it("follows the publication order of the API, not the registration date", () => {
		const replaced = revision("3", "2026-11-14T12:00:00Z", {
			status: "SUPERSEDED",
			verifiedAt: "2026-11-14T13:00:00Z",
		});
		const current = revision("2", "2026-11-12T12:00:00Z", {
			status: "PUBLISHED",
			verifiedAt: "2026-11-15T12:00:00Z",
		});
		hooks.revisions.mockReturnValue(
			revisionsReturn([current, replaced, older]),
		);

		render(<NormativeTableHistory table={current} definition={quadro37} />);

		expect(hooks.compare).toHaveBeenCalledWith({ id: "2", from: "3", to: "2" });
	});

	it("shows how the origin printed a row whose label changed", () => {
		hooks.compare.mockReturnValue({
			isError: false,
			data: {
				data: {
					...comparison,
					changed: [
						{
							before: { upperBound: 25, value: 1.4, label: "Até 25 kVA" },
							after: { upperBound: 25, value: 1.4, label: "Dr ≤ 25 kVA" },
						},
					],
					included: [],
					removed: [],
				},
			},
		});

		render(<NormativeTableHistory table={newer} definition={quadro37} />);

		const [, changed] = within(screen.getByRole("table")).getAllByRole("row");

		expect(within(changed).getByText("Dr ≤ 25 kVA")).toBeVisible();
		expect(within(changed).getByText("Antes: Até 25 kVA")).toBeVisible();
		for (const value of within(changed).getAllByText("1,4")) {
			expect(value).toHaveClass("text-faint-foreground");
		}
	});

	it("compares the revisions picked as origin and destination", async () => {
		hooks.revisions.mockReturnValue(revisionsReturn([latest, newer, older]));

		render(<NormativeTableHistory table={latest} definition={quadro37} />);

		expect(hooks.compare).toHaveBeenLastCalledWith({
			id: "3",
			from: "2",
			to: "3",
		});

		await pick("Revisão de origem", "Revisão 01");

		expect(hooks.compare).toHaveBeenLastCalledWith({
			id: "3",
			from: "1",
			to: "3",
		});

		await pick("Revisão de destino", "Revisão 02");

		expect(hooks.compare).toHaveBeenLastCalledWith({
			id: "3",
			from: "1",
			to: "2",
		});
	});

	it("offers as origin only the revisions before the destination, and the reverse", async () => {
		hooks.revisions.mockReturnValue(revisionsReturn([latest, newer, older]));

		render(<NormativeTableHistory table={newer} definition={quadro37} />);

		fireEvent.click(
			screen.getByRole("combobox", { name: "Revisão de origem" }),
		);
		expect(
			await screen.findByRole("option", { name: "Revisão 01" }),
		).not.toHaveAttribute("aria-disabled", "true");
		expect(screen.getByRole("option", { name: "Revisão 02" })).toHaveAttribute(
			"aria-disabled",
			"true",
		);
		expect(screen.getByRole("option", { name: "Revisão 03" })).toHaveAttribute(
			"aria-disabled",
			"true",
		);
		fireEvent.keyDown(document.activeElement ?? document.body, {
			key: "Escape",
		});

		fireEvent.click(
			screen.getByRole("combobox", { name: "Revisão de destino" }),
		);
		await vi.waitFor(() =>
			expect(
				screen.getByRole("option", { name: "Revisão 01" }),
			).toHaveAttribute("aria-disabled", "true"),
		);
		expect(
			screen.getByRole("option", { name: "Revisão 02" }),
		).not.toHaveAttribute("aria-disabled", "true");
		expect(
			screen.getByRole("option", { name: "Revisão 03" }),
		).not.toHaveAttribute("aria-disabled", "true");
	});

	it("fades the values that stayed the same on a changed row", () => {
		hooks.compare.mockReturnValue({
			isError: false,
			data: {
				data: {
					...comparison,
					changed: [
						{
							before: {
								upperBound: 66,
								value: 2,
								secondValue: 35,
								thirdValue: 100,
							},
							after: {
								upperBound: 66,
								value: 2,
								secondValue: 50,
								thirdValue: 125,
							},
						},
					],
					included: [],
					removed: [],
				},
			},
		});

		render(<NormativeTableHistory table={newer} definition={tabela2} />);

		const [, changed] = within(screen.getByRole("table")).getAllByRole("row");
		const [, origin, destination] = within(changed).getAllByRole("cell");
		const [category, conductor, breaker] =
			within(destination).getAllByRole("listitem");

		expect(category).toHaveClass("text-faint-foreground");
		expect(conductor).not.toHaveClass("text-faint-foreground");
		expect(breaker).not.toHaveClass("text-faint-foreground");
		expect(within(conductor).getByText("50")).toBeVisible();
		expect(within(origin).getAllByRole("listitem")[0]).toHaveClass(
			"text-faint-foreground",
		);
		expect(within(origin).getByText("35")).toBeVisible();
	});

	it("says when nothing changed between the revisions", () => {
		hooks.compare.mockReturnValue({
			isError: false,
			data: { data: { ...comparison, changed: [], included: [], removed: [] } },
		});

		render(<NormativeTableHistory table={newer} definition={quadro37} />);

		expect(
			screen.getByText("Nenhuma linha mudou entre as duas revisões."),
		).toBeVisible();
	});

	it("explains that a single revision has nothing to compare", () => {
		hooks.revisions.mockReturnValue(revisionsReturn([older]));

		render(<NormativeTableHistory table={older} definition={quadro37} />);

		expect(
			screen.getByText(/Esta é a única revisão desta tabela/),
		).toBeVisible();
		expect(screen.getByText("01 revisão")).toBeVisible();
		expect(hooks.compare).not.toHaveBeenCalled();
	});
});

describe("NormativeTableHistory navigation", () => {
	const replaced = revision("1", "2026-07-01T12:00:00Z", {
		status: "SUPERSEDED",
		verifiedAt: "2026-07-10T12:00:00Z",
		supersededAt: "2026-11-15T12:00:00Z",
	});
	const current = revision("2", "2026-11-12T12:00:00Z", {
		status: "PUBLISHED",
		verifiedAt: "2026-11-15T12:00:00Z",
	});

	beforeEach(() => {
		hooks.revisions.mockReturnValue(revisionsReturn([current, replaced]));
		hooks.compare.mockReturnValue({
			isError: false,
			data: { data: comparison },
		});
	});

	it("opens a superseded revision from the list", () => {
		const onOpenRevision = vi.fn();
		render(
			<NormativeTableHistory
				table={current}
				definition={quadro37}
				onOpenRevision={onOpenRevision}
			/>,
		);

		expect(
			screen.queryByRole("button", { name: "Abrir Revisão 02" }),
		).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Abrir Revisão 01" }));

		expect(onOpenRevision).toHaveBeenCalledWith("1");
	});

	it("shows when each revision was in effect", () => {
		render(<NormativeTableHistory table={current} definition={quadro37} />);

		const [currentRow, replacedRow] = within(
			screen.getByRole("region", { name: "Revisões" }),
		).getAllByRole("listitem");

		expect(within(currentRow).getByText("desde 15/11/2026")).toBeVisible();
		expect(
			within(replacedRow).getByText("10/07/2026 a 15/11/2026"),
		).toBeVisible();
	});
});
