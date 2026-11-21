import { describe, expect, it } from "vitest";

import { sumLoadsKw, unitInstalledKw, unitLoadNotice } from "./unit-load";

describe("unitLoadNotice", () => {
	it("accepts exactly 75 kW, the low-voltage limit", () => {
		expect(unitLoadNotice("THREE_PHASE", 75)).toBeNull();
	});

	it("warns just above 75 kW", () => {
		expect(unitLoadNotice("THREE_PHASE", 75.01)).toBe(
			"Carga instalada de 75,01 kW por unidade passa do limite de 75 kW da baixa tensão (DIS-NOR-030, item 6.2.1).",
		);
	});

	it("accepts exactly 15 kW on a single-phase apartment", () => {
		expect(unitLoadNotice("SINGLE_PHASE", 15)).toBeNull();
	});

	it("warns just above 15 kW on a single-phase apartment", () => {
		expect(unitLoadNotice("SINGLE_PHASE", 15.01)).toContain(
			"Carga instalada de 15,01 kW passa de 15 kW, teto da ligação monofásica",
		);
	});

	it("has no 15 kW ceiling for a three-phase apartment", () => {
		expect(unitLoadNotice("THREE_PHASE", 40)).toBeNull();
	});

	it("gives the 75 kW notice alone on a single-phase apartment", () => {
		expect(unitLoadNotice("SINGLE_PHASE", 80)).toContain(
			"passa do limite de 75 kW",
		);
	});
});

describe("unitInstalledKw", () => {
	const loads = [
		{ quantity: 2, power: 5.5, powerUnit: "KW" as const },
		{ quantity: 1, power: 1, powerUnit: "CV" as const },
		{ quantity: 1, power: 1, powerUnit: "HP" as const },
	];

	it("adds the plate powers of a three-phase apartment in kW", () => {
		expect(sumLoadsKw(loads)).toBeCloseTo(11 + 0.7355 + 0.7457, 6);
		expect(unitInstalledKw("THREE_PHASE", 99, loads)).toBeCloseTo(12.4812, 6);
	});

	it("reads the declared total of a single-phase apartment", () => {
		expect(unitInstalledKw("SINGLE_PHASE", "12.5", loads)).toBe(12.5);
	});

	it("ignores what is still being typed", () => {
		expect(unitInstalledKw("SINGLE_PHASE", "", [])).toBe(0);
		expect(
			sumLoadsKw([{ quantity: 1, power: null, powerUnit: "KW" as const }]),
		).toBe(0);
	});
});

describe("sumLoadsKw with an air conditioner in BTU/h", () => {
	it("leaves its watts to the back, which reads Tabela 11", () => {
		expect(
			sumLoadsKw([
				{ quantity: 2, power: 14000, powerUnit: "BTU_H" as const },
				{ quantity: 1, power: 3, powerUnit: "KW" as const },
			]),
		).toBe(3);
	});
});
