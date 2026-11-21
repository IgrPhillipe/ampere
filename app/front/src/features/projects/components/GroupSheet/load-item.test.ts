import { describe, expect, it } from "vitest";

import { powerUnitItemsFor } from "./load-item";

describe("powerUnitItemsFor", () => {
	it("offers BTU/h for an air conditioner", () => {
		expect(powerUnitItemsFor("AIR_CONDITIONING")).toEqual({
			KW: "kW",
			CV: "CV",
			HP: "HP",
			BTU_H: "BTU/h",
		});
	});

	it("keeps BTU/h out of the other loads", () => {
		expect(powerUnitItemsFor("MOTORS")).toEqual({
			KW: "kW",
			CV: "CV",
			HP: "HP",
		});
	});
});
