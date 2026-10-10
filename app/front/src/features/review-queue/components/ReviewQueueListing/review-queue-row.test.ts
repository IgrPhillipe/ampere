import type { ReviewQueueItem } from "@services/review-queue";
import { describe, expect, it } from "vitest";

import { getQueueItemAttention } from "./review-queue-row";

const item: ReviewQueueItem = {
	id: "1",
	name: "Condomínio Vila Nova",
	protocol: "2026-0475",
	municipality: "Recife",
	submittedAt: "2026-09-08T12:00:00Z",
	deadline: "2026-10-08",
	deadlineStatus: "ON_TIME",
	daysRemaining: 20,
	warnings: 0,
	ownerName: null,
	consumerUnitsCount: 0,
	demandKva: null,
	reanalysis: false,
};

describe("getQueueItemAttention", () => {
	it("stays quiet for an on-time project without alerts", () => {
		expect(getQueueItemAttention(item)).toBeNull();
	});

	it("leads with the overdue deadline and lists the alerts", () => {
		expect(
			getQueueItemAttention({
				...item,
				deadlineStatus: "OVERDUE",
				daysRemaining: -1,
				warnings: 2,
			}),
		).toEqual({
			severity: "critical",
			title: "Prazo vencido há 1 dia",
			details: [
				"Venceu em 08/10/2026",
				"2 alertas na pré-validação do cálculo",
			],
			action: "Priorize esta análise.",
		});
	});

	it("flags an on-time project that carries alerts", () => {
		expect(getQueueItemAttention({ ...item, warnings: 1 })?.title).toBe(
			"1 alerta na pré-validação do cálculo",
		);
	});
});
