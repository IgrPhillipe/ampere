import { describe, expect, it } from "vitest";

import { projectCreationSchema } from "./project-creation.schema";

const valid = {
	name: "Residencial Aurora",
	postalCode: "50030-230",
	state: "PE",
	municipality: "Recife",
	address: "Cais do Apolo, 1",
	floors: "8",
	buildingType: "RESIDENTIAL_MULTIFAMILY",
	voltage: "V380_220",
	connectionType: "THREE_PHASE",
	entranceStandard: "COLLECTIVE",
};

const issuesOf = (values: Partial<typeof valid>) =>
	(
		projectCreationSchema.safeParse({ ...valid, ...values }).error?.issues ?? []
	).map(({ path, message }) => `${path.join(".")}: ${message}`);

describe("projectCreationSchema address", () => {
	it("accepts a served address", () => {
		expect(issuesOf({})).toEqual([]);
	});

	it("refuses a CEP outside the area even with a served municipality", () => {
		expect(issuesOf({ postalCode: "01310-100" })).toEqual([
			"postalCode: Fora da área atendida pela Neoenergia Pernambuco: Pernambuco ou Pedras de Fogo (PB).",
		]);
	});

	it("refuses a CEP of the other state", () => {
		expect(
			issuesOf({
				postalCode: "58328-000",
				state: "PE",
				municipality: "Recife",
			}),
		).toEqual(["postalCode: O CEP não pertence à UF informada."]);
	});

	it("refuses an unknown municipality", () => {
		expect(issuesOf({ municipality: "Cidade Inventada" })).toEqual([
			"municipality: Fora da área atendida pela Neoenergia Pernambuco: Pernambuco ou Pedras de Fogo (PB).",
		]);
	});
});
