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
	it("approves when there is no finding", () => {
		expect(getDecisionAvailability([])).toEqual({
			pendingCount: 0,
			blockingCount: 0,
			decision: "APPROVE",
			blockedReason: null,
		});
	});

	it("only rejects while a finding of this analysis is a draft", () => {
		const availability = getDecisionAvailability([finding]);

		expect(availability.decision).toBe("REJECT");
		expect(availability.pendingCount).toBe(1);
	});

	it("rejects a reanalysis on a reopened finding, as the API does", () => {
		expect(
			getDecisionAvailability([
				{ ...finding, severity: "BLOCKING", status: "OPEN" },
			]),
		).toMatchObject({ decision: "REJECT", blockingCount: 1 });
	});

	it("waits for the analyst to accept or reopen an answered finding", () => {
		const availability = getDecisionAvailability([
			{ ...finding, severity: "BLOCKING", status: "FIXED" },
		]);

		expect(availability.decision).toBeNull();
		expect(availability.blockedReason).toBe(
			"Aceite ou reabra os apontamentos respondidos para concluir a análise.",
		);
	});

	it("approves once every finding is resolved", () => {
		expect(
			getDecisionAvailability([
				{ ...finding, severity: "BLOCKING", status: "RESOLVED" },
			]),
		).toMatchObject({
			pendingCount: 0,
			blockingCount: 0,
			decision: "APPROVE",
		});
	});
});
