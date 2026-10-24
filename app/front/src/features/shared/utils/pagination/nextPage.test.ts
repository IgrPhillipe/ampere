import { describe, expect, it } from "vitest";

import { nextPage } from "./nextPage";

describe("nextPage", () => {
	it("moves on while there are items past the current page", () => {
		expect(nextPage({ page: 1, pageSize: 20, total: 21 })).toBe(2);
	});

	it("stops on the last page", () => {
		expect(nextPage({ page: 2, pageSize: 20, total: 40 })).toBeUndefined();
		expect(nextPage({ page: 1, pageSize: 20, total: 0 })).toBeUndefined();
	});
});
