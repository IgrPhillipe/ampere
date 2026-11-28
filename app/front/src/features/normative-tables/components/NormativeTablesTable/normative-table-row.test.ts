import type { NormativeTable } from "@services/normative-tables";
import { describe, expect, it } from "vitest";

import {
	getNormativeTableAction,
	getNormativeTableAttention,
	getNormativeTableTarget,
} from "./normative-table-row";

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
	registeredByName: registeredBy,
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

describe("a published line with a draft waiting for review", () => {
	const published: NormativeTable = {
		...draft("admin@ampere.com"),
		id: "2",
		status: "PUBLISHED",
		verifiedBy: "conferente@ampere.com",
		verifiedByName: "conferente@ampere.com",
		verifiedAt: "2026-11-11T12:00:00Z",
	};
	const line = { ...published, pendingRevision: draft("revisor@ampere.com") };

	it("leads to the draft", () => {
		expect(getNormativeTableTarget(line).id).toBe("1");
		expect(getNormativeTableTarget(published).id).toBe("2");
	});

	it("asks another reviewer to review it and lets the author edit it", () => {
		expect(getNormativeTableAction(line, "analista@ampere.com")).toEqual({
			label: "Revisar",
			required: true,
		});
		expect(
			getNormativeTableAttention(line, "analista@ampere.com", true)?.details,
		).toEqual(["Cadastrada por revisor@ampere.com"]);
		expect(getNormativeTableAction(line, "revisor@ampere.com").label).toBe(
			"Editar",
		);
		expect(
			getNormativeTableAction(published, "analista@ampere.com").label,
		).toBe("Ver Tabela");
	});
});
