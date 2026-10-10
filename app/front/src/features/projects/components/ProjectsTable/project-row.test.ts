import type { Project } from "@services/projects";
import { describe, expect, it } from "vitest";

import { getProjectRowAction } from "./project-row";

const project: Project = {
	id: "1",
	name: "Condomínio Vila Nova",
	address: "Rua A, 1",
	municipality: "Recife",
	protocol: "2026-0475",
	status: "DRAFT",
	createdAt: "2026-10-01T12:00:00Z",
	updatedAt: "2026-10-02T12:00:00Z",
	pendingCount: 0,
	consumerUnitsCount: 0,
	demandKva: null,
};

describe("getProjectRowAction", () => {
	it.each([
		["DRAFT", 0, "Continuar", true],
		["AWAITING_SUBMISSION", 0, "Enviar", true],
		["REJECTED", 2, "Corrigir", true],
		["UNDER_REVIEW", 0, "Ver Projeto", false],
		["APPROVED", 0, "Ver Projeto", false],
	] as const)("%s offers %s", (status, pendingCount, label, required) => {
		expect(
			getProjectRowAction({ ...project, status, pendingCount }),
		).toMatchObject({ label, required });
	});
});
