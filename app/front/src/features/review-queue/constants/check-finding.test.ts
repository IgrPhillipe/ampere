import { describe, expect, it } from "vitest";

import { checkToFindingValues, extractStandardItem } from "./check-finding";

describe("extractStandardItem", () => {
	it("reads the item cited between parentheses", () => {
		expect(
			extractStandardItem(
				"Recarga de 44,40 kW instalados, acima de 20 kW: exige estudo da rede de distribuição (DIS-NOR-030, item 6.26.4.2).",
			),
		).toBe("DIS-NOR-030, item 6.26.4.2");
	});

	it("keeps the annex of the standard", () => {
		expect(
			extractStandardItem(
				"Demanda calculada de 320,00 kVA acima da última faixa da Tabela 1 (DIS-NOR-053 Anexo I, item 8).",
			),
		).toBe("DIS-NOR-053 Anexo I, item 8");
	});

	it("is empty without a citation", () => {
		expect(extractStandardItem("Sem referência normativa.")).toBe("");
	});
});

describe("checkToFindingValues", () => {
	it("points the network study to the charging step", () => {
		expect(
			checkToFindingValues({
				code: "NETWORK_STUDY",
				status: "WARNING",
				message: "Exige estudo da rede (DIS-NOR-030, item 6.26.4.2).",
			}),
		).toEqual({
			stage: "CALCULATION",
			reference: "Dve",
			description: "Exige estudo da rede (DIS-NOR-030, item 6.26.4.2).",
			standardItem: "DIS-NOR-030, item 6.26.4.2",
		});
	});

	it("falls back to the calculation stage for an unknown check", () => {
		expect(
			checkToFindingValues({ code: "NEW", status: "WARNING", message: "x" }),
		).toMatchObject({ stage: "CALCULATION", reference: "" });
	});
});
