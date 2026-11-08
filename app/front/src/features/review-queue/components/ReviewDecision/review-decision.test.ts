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
			decisions: ["APPROVE"],
			reservations: [],
			blockedReason: null,
			approvalBlockedReason: null,
		});
	});

	it("offers both decisions while only adjustments are pending", () => {
		const availability = getDecisionAvailability([finding]);

		expect(availability.decisions).toEqual(["APPROVE", "REJECT"]);
		expect(availability.reservations).toEqual([finding]);
		expect(availability.pendingCount).toBe(1);
	});

	it("only rejects while a blocking finding is a draft", () => {
		const availability = getDecisionAvailability([
			finding,
			{ ...finding, id: "2", severity: "BLOCKING" },
		]);

		expect(availability.decisions).toEqual(["REJECT"]);
		expect(availability.reservations).toEqual([]);
		expect(availability.approvalBlockedReason).toBe(
			"Resolva ou exclua os apontamentos bloqueantes para aprovar.",
		);
	});

	it("rejects a reanalysis on a reopened blocking finding, as the API does", () => {
		expect(
			getDecisionAvailability([
				{ ...finding, severity: "BLOCKING", status: "OPEN" },
			]),
		).toMatchObject({ decisions: ["REJECT"], blockingCount: 1 });
	});

	it("keeps a reopened adjustment as a reservation of the approval", () => {
		const reopened = { ...finding, status: "OPEN" } as const;

		expect(
			getDecisionAvailability([
				reopened,
				{ ...finding, id: "2", severity: "BLOCKING", status: "RESOLVED" },
			]),
		).toMatchObject({
			decisions: ["APPROVE", "REJECT"],
			reservations: [reopened],
		});
	});

	it("waits for the analyst to accept or reopen an answered finding", () => {
		const availability = getDecisionAvailability([
			{ ...finding, status: "FIXED" },
		]);

		expect(availability.decisions).toEqual([]);
		expect(availability.reservations).toEqual([]);
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
			decisions: ["APPROVE"],
			reservations: [],
		});
	});
});
