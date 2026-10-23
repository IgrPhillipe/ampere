import type { Finding } from "@services/project-review";
import { describe, expect, it } from "vitest";

import { getDecisionAvailability } from "./review-decision";

const finding: Finding = {
	id: "1",
	projectId: "10",
	severity: "ADJUSTMENT",
	stage: "CALCULATION",
	consumerUnitGroupId: null,
	calculationStepCode: "Dve",
	documentType: null,
	description: "Comprovar o gerenciamento de recarga.",
	standardItem: "DIS-NOR-030, item 6.26.4.2",
	authorId: "2",
	authorName: "Ana Analista",
	createdAt: "2026-10-13T12:00:00Z",
	version: 1,
	status: "DRAFT",
	response: null,
	respondedAt: null,
};

describe("getDecisionAvailability", () => {
	it("approves without findings and asks for one to reject", () => {
		expect(getDecisionAvailability([])).toEqual({
			pendingCount: 0,
			blockingCount: 0,
			approveBlockedReason: null,
			rejectBlockedReason:
				"Registre um apontamento ou reabra um anterior para reprovar o projeto.",
		});
	});

	it("blocks the approval while a blocking draft exists", () => {
		const availability = getDecisionAvailability([
			{ ...finding, severity: "BLOCKING" },
		]);

		expect(availability.approveBlockedReason).toBe(
			"Exclua o apontamento bloqueante ou reprove o projeto.",
		);
		expect(availability.rejectBlockedReason).toBeNull();
		expect(availability.blockingCount).toBe(1);
	});

	it("lets an adjustment through the approval", () => {
		expect(getDecisionAvailability([finding]).approveBlockedReason).toBeNull();
	});

	it("asks to accept the correction of a previous blocking finding", () => {
		const availability = getDecisionAvailability([
			{ ...finding, severity: "BLOCKING", status: "FIXED" },
		]);

		expect(availability.approveBlockedReason).toBe(
			"Aceite a correção dos apontamentos bloqueantes ou reprove o projeto.",
		);
		expect(availability.pendingCount).toBe(1);
	});

	it("rejects a reanalysis on a reopened finding, as the API does", () => {
		const availability = getDecisionAvailability([
			{ ...finding, severity: "BLOCKING", status: "OPEN" },
		]);

		expect(availability.rejectBlockedReason).toBeNull();
		expect(availability.approveBlockedReason).not.toBeNull();
	});

	it("needs a reopened finding to reject when every previous one was fixed", () => {
		expect(
			getDecisionAvailability([{ ...finding, status: "FIXED" }])
				.rejectBlockedReason,
		).toBe(
			"Registre um apontamento ou reabra um anterior para reprovar o projeto.",
		);
	});

	it("stops counting a resolved finding as pending", () => {
		expect(
			getDecisionAvailability([
				{ ...finding, severity: "BLOCKING", status: "RESOLVED" },
			]),
		).toMatchObject({
			pendingCount: 0,
			blockingCount: 0,
			approveBlockedReason: null,
		});
	});
});
