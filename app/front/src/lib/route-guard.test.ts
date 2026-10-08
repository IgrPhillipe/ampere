import {
	APP_NAV_ITEMS,
	filterNavItemsByRole,
} from "@components/layout/nav-items";
import { describe, expect, it } from "vitest";

import { getRoleHomePath } from "./route-guard";

describe("role navigation", () => {
	it("uses the review queue as the analyst home", () => {
		expect(getRoleHomePath("admin")).toBe("/fila-de-analise");
		expect(getRoleHomePath("user")).toBe("/");
	});

	it("exposes only the role-appropriate primary navigation", () => {
		const analystLabels = filterNavItemsByRole(APP_NAV_ITEMS, "admin").map(
			({ label }) => label,
		);
		const applicantLabels = filterNavItemsByRole(APP_NAV_ITEMS, "user").map(
			({ label }) => label,
		);

		expect(analystLabels).toContain("Fila de Análise");
		expect(analystLabels).not.toContain("Meus Projetos");
		expect(applicantLabels).toContain("Meus Projetos");
		expect(applicantLabels).not.toContain("Fila de Análise");
	});
});
