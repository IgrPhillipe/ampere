import type {
	NormativeTable,
	NormativeTableCode,
	NormativeTableComparison,
} from "@services/normative-tables";
import { render, screen, within } from "@testing-library/react";
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
		expect(within(changed).getByText("1,5")).toBeVisible();
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
