import { describe, expect, it } from "vitest";

import {
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
});
