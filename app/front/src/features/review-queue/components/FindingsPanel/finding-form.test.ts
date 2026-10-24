import {
	buildFindingReferenceOptions,
	type FindingReferenceOptions,
} from "@features/projects";
import { describe, expect, it } from "vitest";

import { toFindingPayload } from "./finding-form";

const options: FindingReferenceOptions = {
	PROJECT_DATA: {},
	CONSUMER_UNITS: { "7": "Recarga veicular" },
	CALCULATION: { Dve: "Recarga de veículos (Dve)" },
	DOCUMENTS: { ART: "ART" },
};

describe("toFindingPayload", () => {
	it("sends the group of a consumer units finding as a number", () => {
		expect(
			toFindingPayload(
				{
					severity: "BLOCKING",
					stage: "CONSUMER_UNITS",
					reference: "7",
					description: " Comprovar o gerenciamento de recarga. ",
					standardItem: "",
				},
				options,
			),
		).toEqual({
			severity: "BLOCKING",
			stage: "CONSUMER_UNITS",
			consumerUnitGroupId: 7,
			calculationStepCode: null,
			documentType: null,
			description: "Comprovar o gerenciamento de recarga.",
			standardItem: null,
		});
	});

	it("drops a reference left over from another stage", () => {
		expect(
			toFindingPayload(
				{
					severity: "ADJUSTMENT",
					stage: "DOCUMENTS",
					reference: "Dve",
					description: "Anexar a planta.",
					standardItem: "DIS-NOR-053, item 6.27.3",
				},
				options,
			),
		).toMatchObject({
			documentType: null,
			calculationStepCode: null,
			standardItem: "DIS-NOR-053, item 6.27.3",
		});
	});
});

describe("buildFindingReferenceOptions", () => {
	it("offers the groups, the demand steps and the documents, not the calculation item", () => {
		expect(
			buildFindingReferenceOptions({
				groups: [{ id: "7", name: "Recarga veicular" }],
				steps: [{ code: "Dve", title: "Recarga de veículos" }],
				checklistItems: [
					{ key: "CALCULATION", label: "Cálculo de demanda" },
					{ key: "ART", label: "ART" },
				],
			}),
		).toEqual(options);
	});
});
