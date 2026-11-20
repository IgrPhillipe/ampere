import { describe, expect, it } from "vitest";

import {
	projectDetailSchema,
	projectListResponseSchema,
	projectStatusCountsResponseSchema,
} from "./project.schema";

const project = {
	id: "56",
	name: "Residencial Antigo Casarão",
	address: "Rua da Aurora, 120",
	municipality: "Recife",
	state: "PE",
	protocol: "2026-2048",
	ownerId: "1",
	ownerName: "Usuário Teste",
	status: "EXPIRED",
	createdAt: "2023-10-20T23:43:54.386558Z",
	updatedAt: "2026-11-11T23:43:54.386558Z",
	pendingCount: 0,
	consumerUnitsCount: 10,
	demandKva: 61.2,
	approvalValidUntil: "2026-11-10",
};

describe("project schemas", () => {
	it("parses a project whose approval expired", () => {
		const page = projectListResponseSchema.parse({
			data: [project],
			pagination: { total: 1, page: 1, pageSize: 20 },
		});

		expect(page.data[0]?.status).toBe("EXPIRED");
	});

	it("counts the expired projects apart from the approved ones", () => {
		const counts = projectStatusCountsResponseSchema.parse({
			data: {
				total: 3,
				draft: 0,
				awaitingSubmission: 0,
				underReview: 0,
				rejected: 0,
				approved: 2,
				expired: 1,
			},
		});

		expect(counts.data.expired).toBe(1);
	});

	it("keeps the review and approval dates from the detail response", () => {
		const detail = projectDetailSchema.parse({
			id: "56",
			name: "Residencial Antigo Casarão",
			address: "Rua da Aurora, 120",
			municipality: "Recife",
			state: "PE",
			postalCode: null,
			protocol: "2026-2048",
			status: "REJECTED",
			createdAt: "2023-10-20T23:43:54.386558Z",
			updatedAt: "2026-11-11T23:43:54.386558Z",
			submittedAt: "2026-10-01T12:00:00Z",
			ownerId: "1",
			ownerName: "Usuário Teste",
			reviewerId: "2",
			reviewerName: "Analista Teste",
			reviewDeadline: null,
			deadlineStatus: null,
			daysRemaining: 8,
			elapsedDays: 22,
			suspendedDays: 5,
			reviewSuspended: true,
			approvalValidUntil: null,
			reviewedAt: "2026-11-11T23:43:54.386558Z",
			reviewCycle: 1,
			openFindingsCount: 0,
			consumerUnitsCount: 10,
			demandKva: 61.2,
			lastActivityAt: "2026-11-11T23:43:54.386558Z",
			reviewOpinion: null,
			changeSummary: null,
			technicalResponsible: null,
			buildingType: "RESIDENTIAL_MULTIFAMILY",
			floors: 4,
			voltage: "V220_127",
			connectionType: "THREE_PHASE",
			entranceStandard: "COLLECTIVE",
			standards: [],
			applicableStandards: "DIS-NOR-030",
			demandRules: [],
		});

		expect(detail).toMatchObject({
			daysRemaining: 8,
			elapsedDays: 22,
			suspendedDays: 5,
			reviewSuspended: true,
		});
	});
});
