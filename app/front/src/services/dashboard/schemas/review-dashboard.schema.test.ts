import { describe, expect, it } from "vitest";

import { reviewDashboardResponseSchema } from "./review-dashboard.schema";

const makeResponse = () => ({
	data: {
		totals: { received: 31, approved: 14, rejected: 9, underReview: 8 },
		averageReviewDays: 6.5,
		averageCycleDays: null,
		weekly: [{ weekStart: "2026-11-02", received: 7, decided: 5 }],
		monthlyRejection: [
			{ month: "2026-10", rejectionPercent: 40 },
			{ month: "2026-11", rejectionPercent: null },
		],
		deadlines: { met: 20, overdue: 3 },
		findingsRanking: [
			{
				stage: "CALCULATION",
				standardItem: "Fator de demanda",
				total: 12,
				projects: [
					{ id: "41", name: "Edifício Aurora", protocol: "2026-0481" },
				],
			},
		],
		municipalities: [{ municipality: "Recife", state: "PE", total: 11 }],
		repeatedRejections: [
			{
				id: "50",
				name: "Comercial Derby",
				protocol: "2026-0490",
				rejections: 2,
			},
		],
		alertsByCategory: [{ category: "MIXED", alerts: 3, projects: 2 }],
	},
});

describe("reviewDashboardResponseSchema", () => {
	it("reads every indicator of the analysis panel", () => {
		const parsed = reviewDashboardResponseSchema.parse(makeResponse());

		expect(parsed.data.totals.approved).toBe(14);
		expect(parsed.data.findingsRanking[0]?.projects).toHaveLength(1);
		expect(parsed.data.monthlyRejection[1]?.rejectionPercent).toBeNull();
	});

	it("refuses a project rejected only once in the repeated rejections", () => {
		const response = makeResponse();
		response.data.repeatedRejections[0].rejections = 1;

		expect(reviewDashboardResponseSchema.safeParse(response).success).toBe(
			false,
		);
	});

	it("refuses a category outside the building contract", () => {
		const response = makeResponse();
		response.data.alertsByCategory[0].category = "INDUSTRIAL";

		expect(reviewDashboardResponseSchema.safeParse(response).success).toBe(
			false,
		);
	});
});
