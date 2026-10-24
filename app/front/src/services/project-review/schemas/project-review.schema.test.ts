import { describe, expect, it } from "vitest";

import { findingSchema } from "./project-review.schema";

const finding = {
	id: "12",
	projectId: "4",
	severity: "BLOCKING",
	stage: "DOCUMENTS",
	consumerUnitGroupId: null,
	calculationStepCode: null,
	documentType: "ART",
	description: "A ART não traz a assinatura do responsável técnico.",
	standardItem: null,
	authorId: "2",
	authorName: "Admin Teste",
	createdAt: "2026-10-04T13:00:00Z",
	version: 1,
	status: "CONTESTED",
	response: "A assinatura consta na segunda página.",
	respondedAt: "2026-10-16T14:20:00Z",
};

describe("findingSchema", () => {
	it("parses the response fields delivered by the resubmission API", () => {
		expect(findingSchema.parse(finding)).toMatchObject({
			status: "CONTESTED",
			response: "A assinatura consta na segunda página.",
			respondedAt: "2026-10-16T14:20:00Z",
		});
	});

	it("accepts unanswered findings", () => {
		expect(
			findingSchema.parse({
				...finding,
				status: "OPEN",
				response: null,
				respondedAt: null,
			}),
		).toBeDefined();
	});
});
