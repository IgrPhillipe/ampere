import { describe, expect, it } from "vitest";

import { designerDashboardResponseSchema } from "./dashboard.schema";

const makeResponse = () => ({
	data: {
		hasSubmissions: true,
		actionRequired: [
			{
				id: "7",
				name: "Edifício Residencial Aurora",
				protocol: "2026-0481",
				status: "REJECTED",
				blockingFindings: 2,
				idleDays: null,
				version: 2,
				consumerUnits: 60,
				rejectedAt: "2026-09-05T15:00:00-03:00",
				pendingStage: null,
			},
			{
				id: "9",
				name: "Edifício Torre Norte",
				protocol: null,
				status: "DRAFT",
				blockingFindings: 0,
				idleDays: 21,
				version: 0,
				consumerUnits: 36,
				rejectedAt: null,
				pendingStage: "CALCULATION",
			},
		],
		underReview: [
			{
				id: "12",
				name: "Comercial Derby",
				protocol: "2026-0490",
				version: 1,
				deadline: "2026-10-30",
				daysRemaining: -3,
			},
		],
		indicators: {
			submitted: 9,
			firstReviewApprovalPercent: 56.5,
			averageDaysToApproval: 21,
			approvedDemand: 612.4,
		},
		findingsRanking: [
			{ stage: "CALCULATION", standardItem: "Quadro 33", total: 5 },
			{ stage: "DOCUMENTS", standardItem: null, total: 3 },
		],
	},
});

describe("designer dashboard API contract", () => {
	it("accepts a draft without protocol and an overdue review", () => {
		const response = makeResponse();

		expect(designerDashboardResponseSchema.parse(response)).toEqual(response);
	});

	it("accepts a designer who never submitted", () => {
		const response = {
			data: {
				hasSubmissions: false,
				actionRequired: [],
				underReview: [],
				indicators: {
					submitted: 0,
					firstReviewApprovalPercent: null,
					averageDaysToApproval: null,
					approvedDemand: 0,
				},
				findingsRanking: [],
			},
		};

		expect(designerDashboardResponseSchema.parse(response)).toEqual(response);
	});

	it("rejects a status outside the action list and a percent above 100", () => {
		const unknownStatus = makeResponse();
		unknownStatus.data.actionRequired[0].status = "APPROVED";

		const overflow = makeResponse();
		overflow.data.indicators.firstReviewApprovalPercent = 120;

		expect(
			designerDashboardResponseSchema.safeParse(unknownStatus).success,
		).toBe(false);
		expect(designerDashboardResponseSchema.safeParse(overflow).success).toBe(
			false,
		);
	});
});
