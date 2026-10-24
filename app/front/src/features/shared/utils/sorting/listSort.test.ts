import { describe, expect, it } from "vitest";

import { nextSort } from "./listSort";

const directions = { deadline: "ASC", demand: "DESC" } as const;

describe("nextSort", () => {
	it("flips the sorted column", () => {
		expect(
			nextSort(
				{ column: "deadline", direction: "ASC" },
				"deadline",
				directions,
			),
		).toEqual({ column: "deadline", direction: "DESC" });
	});

	it("starts another column in its natural direction", () => {
		expect(
			nextSort({ column: "deadline", direction: "ASC" }, "demand", directions),
		).toEqual({ column: "demand", direction: "DESC" });
	});
});
