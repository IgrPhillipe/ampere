import { describe, expect, it } from "vitest";

import { eventAuthorRoleLabel, eventLabel } from "./project-events";

describe("eventAuthorRoleLabel", () => {
	it.each([
		["CREATED", "user", "Projetista"],
		["REJECTED", "reviewer", "Analista"],
		["APPROVED", "admin", "Analista"],
		["ASSIGNED", "admin", "Analista"],
		["CREATED", "admin", "Projetista"],
		["RESUBMITTED", "admin", "Projetista"],
		["PRE_VALIDATED", null, "Sistema"],
	] as const)("labels %s by %s as %s", (type, authorRole, label) => {
		expect(eventAuthorRoleLabel({ type, authorRole })).toBe(label);
	});
});

describe("eventLabel", () => {
	it("adds the version to the submissions only", () => {
		expect(eventLabel({ type: "RESUBMITTED", version: 3 })).toBe(
			"Reenviado, Versão 3",
		);
		expect(eventLabel({ type: "SUBMITTED", version: 1 })).toBe(
			"Enviado, Versão 1",
		);
		expect(eventLabel({ type: "REJECTED", version: 3 })).toBe("Reprovado");
	});
});
