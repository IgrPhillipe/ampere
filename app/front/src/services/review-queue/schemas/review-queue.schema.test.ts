import { describe, expect, it } from "vitest";

import { makeReviewQueue, makeReviewQueueItem } from "../mocks/factories";
import {
	reviewQueueIndicatorsResponseSchema,
	reviewQueueListResponseSchema,
} from "./review-queue.schema";

describe("review queue API contract", () => {
	it("accepts the enriched project fields and pagination", () => {
		const response = makeReviewQueue({
			items: [
				makeReviewQueueItem({
					applicantName: "José da Silva",
					consumerUnitsCount: 12,
					demandKva: 51.4,
					reanalysis: true,
				}),
			],
		});

		expect(reviewQueueListResponseSchema.parse(response)).toEqual(response);
	});

	it("accepts zeroed indicator values", () => {
		const response = {
			data: {
				total: 0,
				dueSoon: 0,
				highDemand: 0,
				reanalysis: 0,
				reviewedToday: 0,
				monthlyRejectionPercent: 0,
			},
		};

		expect(reviewQueueIndicatorsResponseSchema.parse(response)).toEqual(
			response,
		);
	});
});
