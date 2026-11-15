import type { ConsumerUnitGroup } from "@services/consumer-units";
import { describe, expect, it } from "vitest";

import { groupConnectionLabel } from "./group-connection";

const apartment = (
	connectionType: "SINGLE_PHASE" | "THREE_PHASE" | null,
): ConsumerUnitGroup => ({
	id: "101",
	name: "Apartamentos Tipo",
	kind: "RESIDENTIAL",
	quantity: 12,
	status: "MISSING_DATA",
	issues: [],
	declaredLoadKw: 0,
	summary: "80 m² (DIS-NOR-053 Quadro 35)",
	connectionType,
});

describe("groupConnectionLabel", () => {
	it("names the apartment connection", () => {
		expect(groupConnectionLabel(apartment("SINGLE_PHASE"))).toBe("Monofásico");
		expect(groupConnectionLabel(apartment("THREE_PHASE"))).toBe("Trifásico");
	});

	it("flags an apartment without a connection", () => {
		expect(groupConnectionLabel(apartment(null))).toBe("Não informada");
	});

	it("follows the building for the other groups", () => {
		expect(
			groupConnectionLabel({
				id: "102",
				name: "Administração",
				kind: "LOAD",
				usage: "COMMON_AREA",
				quantity: 1,
				status: "VALIDATED",
				issues: [],
				declaredLoadKw: 5,
				summary: "1 unidade",
				items: [],
			}),
		).toBe("Edificação");
	});
});
