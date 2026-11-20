import { describe, expect, it } from "vitest";

import { formatVersion } from "./version-changes";

describe("formatVersion", () => {
	it("pads the version number", () => {
		expect(formatVersion(3)).toBe("v03");
		expect(formatVersion(12)).toBe("v12");
	});
});
