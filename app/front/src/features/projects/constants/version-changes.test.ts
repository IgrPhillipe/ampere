import { describe, expect, it } from "vitest";

import { fieldValue, formatKvaDelta, formatVersion } from "./version-changes";

describe("version changes", () => {
	it("formats versions and deltas", () => {
		expect(formatVersion(3)).toBe("v03");
		expect(formatKvaDelta(2.44)).toBe("+2,4");
		expect(formatKvaDelta(-1)).toBe("−1,0");
		expect(formatKvaDelta(0)).toBe("0,0");
	});

	it("prefers the readable value of a field", () => {
		const change = {
			field: "connection",
			label: "Ligação",
			from: "SINGLE_PHASE",
			to: "THREE_PHASE",
			fromLabel: "Monofásica",
			toLabel: null,
		};

		expect(fieldValue(change, "from")).toBe("Monofásica");
		expect(fieldValue(change, "to")).toBe("THREE_PHASE");
		expect(fieldValue({ ...change, to: null }, "to")).toBe("Não informado");
		expect(fieldValue({ ...change, to: "3.0" }, "to")).toBe("3");
		expect(fieldValue({ ...change, to: "12.5" }, "to")).toBe("12,5");
	});
});
