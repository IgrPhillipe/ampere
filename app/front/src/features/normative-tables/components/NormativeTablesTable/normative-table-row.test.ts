import type { NormativeTable } from "@services/normative-tables";
import { describe, expect, it } from "vitest";

import { getNormativeTableAttention } from "./normative-table-row";

const draft = (registeredBy: string): NormativeTable => ({
	id: "1",
	standard: { name: "DIS-NOR-053", revision: "REV 06" },
	code: "Q37_SAFETY_FACTOR",
	title: "Fator de segurança",
	identification: "Quadro 37",
	item: "Anexo I, item 5",
	page: "108",
	version: 0,
	status: "DRAFT",
	rowCount: 1,
	registeredBy,
	registeredAt: "2026-11-10T12:00:00Z",
});

describe("getNormativeTableAttention", () => {
	it("asks someone else to approve the revision", () => {
		expect(
			getNormativeTableAttention(
				draft("revisor@ampere.com"),
				"analista@ampere.com",
				true,
			)?.action,
		).toBe("Confira a revisão para aprová-la.");
	});

	it("leaves whoever registered the revision alone", () => {
		expect(
			getNormativeTableAttention(
				draft("revisor@ampere.com"),
				"REVISOR@ampere.com",
				true,
			),
		).toBeNull();
	});
});
