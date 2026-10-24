import { describe, expect, it } from "vitest";

import { findingResponseSchema } from "./finding-response.schema";

describe("findingResponseSchema", () => {
	it("allows a fixed finding without a note", () => {
		expect(
			findingResponseSchema.parse({ status: "FIXED", response: "" }),
		).toEqual({ status: "FIXED", response: "" });
	});

	it("requires a reason when contesting", () => {
		const result = findingResponseSchema.safeParse({
			status: "CONTESTED",
			response: "   ",
		});

		expect(result.success).toBe(false);
		expect(result.error?.issues[0]?.message).toBe(
			"A justificativa é obrigatória para contestar o apontamento.",
		);
	});

	it("limits responses to 2000 characters", () => {
		expect(
			findingResponseSchema.safeParse({
				status: "FIXED",
				response: "x".repeat(2001),
			}).success,
		).toBe(false);
	});
});
