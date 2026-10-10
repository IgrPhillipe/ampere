import { describe, expect, it } from "vitest";

import {
	reviewQueueIndicatorsResponseSchema,
	reviewQueueListResponseSchema,
} from "./review-queue.schema";

describe("review queue API contract", () => {
	it("accepts the enriched project fields and pagination", () => {
		const response = {
			data: [
				{
					id: "42",
					name: "Condomínio Vila Nova",
					protocol: "2026-0475",
					municipality: "Jaboatão dos Guararapes",
					submittedAt: "2026-09-08T12:00:00Z",
					deadline: "2026-10-08",
					deadlineStatus: "DUE_TODAY",
					daysRemaining: 0,
					warnings: 1,
					alerts: [
						"Recarga de 44,40 kW instalados, acima de 20 kW: exige estudo da rede.",
					],
					ownerName: "José da Silva",
					consumerUnitsCount: 12,
					demandKva: 51.4,
					reanalysis: true,
					reviewCycle: 2,
				},
			],
			pagination: { total: 1, page: 1, pageSize: 10 },
		};

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
