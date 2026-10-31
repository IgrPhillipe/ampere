import { describe, expect, it } from "vitest";

import { projectEventListResponseSchema } from "./project-event.schema";

const event = {
	id: "98",
	type: "RESUBMITTED",
	version: 2,
	description: "Versão 2 reenviada para análise.",
	detail: "Área útil do apartamento tipo B corrigida para 84 m².",
	authorName: "Usuário Teste",
	authorRole: "user",
	occurredAt: "2026-10-25T19:37:26.250609Z",
};

describe("projectEventListResponseSchema", () => {
	it("parses an event as the API sends it, with microseconds", () => {
		expect(
			projectEventListResponseSchema.parse({ data: [event] }).data[0],
		).toEqual(event);
	});

	it("parses a system event without author", () => {
		const system = {
			...event,
			type: "PRE_VALIDATED",
			authorName: null,
			authorRole: null,
		};

		expect(projectEventListResponseSchema.parse({ data: [system] })).toEqual({
			data: [system],
		});
	});

	it("rejects a numeric id", () => {
		expect(() =>
			projectEventListResponseSchema.parse({ data: [{ ...event, id: 98 }] }),
		).toThrow();
	});
});
