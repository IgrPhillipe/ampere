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

	it.each([
		[
			"UNIT_CONNECTION",
			"Há apartamento trifásico, mas o tipo de ligação da edificação é monofásico: confira a ligação da edificação ou a das unidades.",
			"",
		],
		[
			"LOW_VOLTAGE_LIMIT",
			"Maior carga instalada por apartamento de 19,47 kW, dentro do limite de 75 kW da baixa tensão (DIS-NOR-030, item 6.2.1).",
			"DIS-NOR-030, item 6.2.1",
		],
	])("points %s to the individual demand step", (code, message, standardItem) => {
		expect(checkToFindingValues({ code, status: "WARNING", message })).toEqual({
			stage: "CALCULATION",
			reference: "Dind",
			description: message,
			standardItem,
		});
	});

	it("falls back to the calculation stage for an unknown check", () => {
		expect(
			checkToFindingValues({ code: "NEW", status: "WARNING", message: "x" }),
		).toMatchObject({ stage: "CALCULATION", reference: "" });
	});
});
