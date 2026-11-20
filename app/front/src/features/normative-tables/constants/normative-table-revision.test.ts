import type {
	NormativeTableCode,
	NormativeTableRow,
} from "@services/normative-tables";
import { describe, expect, it } from "vitest";

import {
	formatCount,
	formatRowEntry,
	rowValues,
} from "./normative-table-revision";

const row = (fields: Partial<NormativeTableRow>): NormativeTableRow => ({
	value: 1,
	...fields,
});

const tabela2: NormativeTableCode = {
	code: "T2_SERVICE_ENTRANCE_380_220",
	standard: "DIS-NOR-030",
	identification: "Tabela 2",
	title: "Entrada de serviço",
	item: "6.1",
	page: "20",
	keys: [{ code: "STORES", label: "Bancos, lojas e semelhantes" }],
	argumentLabel: "Demanda (kVA)",
	valueLabels: ["Categoria", "Condutor (mm²)", "Disjuntor geral (A)"],
};

describe("formatRowEntry", () => {
	it("says the band as the printed table does", () => {
		expect(formatRowEntry(row({ lowerBound: 25, upperBound: 50 }))).toBe(
			"25 a 50",
		);
		expect(formatRowEntry(row({ upperBound: 25 }))).toBe("até 25");
		expect(formatRowEntry(row({ lowerBound: 100 }))).toBe("acima de 100");
		expect(formatRowEntry(row({ lowerBound: 2.5, upperBound: 2.5 }))).toBe(
			"2,5",
		);
	});

	it("prefers the printed label and names the key", () => {
		expect(
			formatRowEntry(
				row({ key: "STORES", upperBound: 25, label: "Dr ≤ 25 kVA" }),
				tabela2,
			),
		).toBe("Bancos, lojas e semelhantes, Dr ≤ 25 kVA");
	});

	it("names a row with neither key nor band", () => {
		expect(formatRowEntry(row({}))).toBe("Linha única");
	});
});

describe("rowValues", () => {
	it("labels each informed value with the column of the table", () => {
		expect(
			rowValues(row({ value: 1, secondValue: 50, thirdValue: 125.5 }), tabela2),
		).toEqual([
			{ label: "Categoria", value: "1" },
			{ label: "Condutor (mm²)", value: "50" },
			{ label: "Disjuntor geral (A)", value: "125,5" },
		]);
	});
});

describe("formatCount", () => {
	it("agrees the noun with the count", () => {
		expect(formatCount(1, "revisão", "revisões")).toBe("01 revisão");
		expect(formatCount(0, "revisão", "revisões")).toBe("00 revisões");
		expect(formatCount(12, "revisão", "revisões")).toBe("12 revisões");
	});
});
