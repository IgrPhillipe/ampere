import {
	APP_NAV_ITEMS,
	filterNavItemsByRole,
} from "@components/layout/nav-items";
import type { UserRole } from "@features/shared";
import { describe, expect, it } from "vitest";

import { getRoleHomePath, ROLE_ACCESS } from "./route-guard";

const labelsOf = (role: UserRole) =>
	filterNavItemsByRole(APP_NAV_ITEMS, role).map(({ label }) => label);

describe("role navigation", () => {
	it("sends each role to its home", () => {
		expect(getRoleHomePath("user")).toBe("/projetos");
		expect(getRoleHomePath("reviewer")).toBe("/fila-de-analise");
		expect(getRoleHomePath("admin")).toBe("/projetos");
	});

	it("gives the designer only their own projects", () => {
		expect(labelsOf("user")).toEqual(["Meus Projetos"]);
	});

	it("gives the analyst only the review queue", () => {
		expect(labelsOf("reviewer")).toEqual(["Fila de Análise"]);
	});

	it("gives the admin every area", () => {
		expect(labelsOf("admin")).toEqual([
			"Projetos",
			"Fila de Análise",
			"Tabelas Normativas",
		]);
	});

	it("keeps the analyst out of the projects and the normative tables", () => {
		expect(ROLE_ACCESS.projects).not.toContain("reviewer");
		expect(ROLE_ACCESS.normativeTables).toEqual(["admin"]);
		expect(ROLE_ACCESS.reviewQueue).not.toContain("user");
	});
});
