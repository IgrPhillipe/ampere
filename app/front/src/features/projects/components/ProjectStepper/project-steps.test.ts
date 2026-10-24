import { describe, expect, it } from "vitest";

import { unlockedStepOf } from "./project-steps";

describe("unlockedStepOf", () => {
	it("opens the units step to any saved draft", () => {
		expect(unlockedStepOf({ status: "DRAFT", hasCalculation: false })).toBe(1);
	});

	it("opens the calculation once the units are valid", () => {
		expect(
			unlockedStepOf({
				status: "DRAFT",
				canCalculate: true,
				hasCalculation: false,
			}),
		).toBe(2);
	});

	it("opens the memorial once a calculation exists", () => {
		expect(
			unlockedStepOf({ status: "AWAITING_SUBMISSION", hasCalculation: true }),
		).toBe(3);
	});

	it("opens every step of a submitted project", () => {
		expect(unlockedStepOf({ status: "REJECTED", hasCalculation: true })).toBe(
			4,
		);
	});
});
