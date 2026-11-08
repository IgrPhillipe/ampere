import type { ReviewQueueItem } from "@services/review-queue";
import { describe, expect, it } from "vitest";

import { getQueueItemAttention } from "./review-queue-row";

const item: ReviewQueueItem = {
	id: "1",
	name: "Condomínio Vila Nova",
	protocol: "2026-0475",
	municipality: "Recife",
	state: "PE",
	submittedAt: "2026-09-08T12:00:00Z",
	deadline: "2026-10-08",
	deadlineStatus: "ON_TIME",
	daysRemaining: 20,
	warnings: 0,
	alerts: [],
	ownerName: null,
	consumerUnitsCount: 0,
	demandKva: null,
	reanalysis: false,
	reviewCycle: 1,
	reviewerId: null,
	reviewerName: null,
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
				alerts: [
					"Recarga de 44,40 kW instalados, acima de 20 kW: exige estudo da rede.",
				],
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

	it("leaves the alerts of an on-time project to their own column", () => {
		expect(getQueueItemAttention({ ...item, warnings: 1 })).toBeNull();
	});
});
