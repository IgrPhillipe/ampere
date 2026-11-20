import { describe, expect, it } from "vitest";

import { myReviewListResponseSchema } from "./my-reviews.schema";

const makeResponse = (decision = "REJECTED") => ({
	data: [
		{
			id: "82",
			name: "Edifício Aurora",
			protocol: "2026-0482",
			municipality: "Recife",
			state: "PE",
			ownerName: null,
			decision,
			decidedAt: "2026-11-10T14:00:00-03:00",
			findings: 4,
			version: 2,
			currentVersion: 3,
			consumerUnitsCount: 24,
			demandKva: null,
		},
	],
	pagination: { total: 1, page: 1, pageSize: 10 },
	counts: { all: 12, approved: 9, rejected: 3 },
});

describe("myReviewListResponseSchema", () => {
	it("reads the decisions with the counts of each chip", () => {
		const parsed = myReviewListResponseSchema.parse(makeResponse());

		expect(parsed.data[0]?.findings).toBe(4);
		expect(parsed.counts).toEqual({ all: 12, approved: 9, rejected: 3 });
	});

	it("refuses a decision other than approval or rejection", () => {
		expect(
			myReviewListResponseSchema.safeParse(makeResponse("PENDING")).success,
		).toBe(false);
	});

	it("needs the counts next to the pagination", () => {
		const { counts: _, ...response } = makeResponse();

		expect(myReviewListResponseSchema.safeParse(response).success).toBe(false);
	});
});
