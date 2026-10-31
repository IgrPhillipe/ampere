import {
	APP_NAV_ITEMS,
	filterNavItemsByRole,
} from "@components/layout/nav-items";
import { type UserRole, useAuthStore } from "@features/shared";
import { afterEach, describe, expect, it } from "vitest";

import { signInAs } from "@/test/fixtures/project-detail";

import { getRoleHomePath, ROLE_ACCESS, redirectSignedIn } from "./route-guard";

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

	it("gives the analyst the review queue and the normative tables", () => {
		expect(labelsOf("reviewer")).toEqual([
			"Fila de Análise",
			"Tabelas Normativas",
		]);
	});

	it("gives the admin every area", () => {
		expect(labelsOf("admin")).toEqual([
			"Projetos",
			"Fila de Análise",
			"Tabelas Normativas",
			"Usuários",
		]);
	});

	it("keeps the analyst out of the projects and the designer out of the tables", () => {
		expect(ROLE_ACCESS.projects).not.toContain("reviewer");
		expect(ROLE_ACCESS.normativeTables).not.toContain("user");
		expect(ROLE_ACCESS.reviewQueue).not.toContain("user");
		expect(ROLE_ACCESS.users).toEqual(["admin"]);
	});
});

describe("redirectSignedIn", () => {
	const at = (state: { signingOut?: boolean } = {}) =>
		({ state }) as unknown as Parameters<
			ReturnType<typeof redirectSignedIn>
		>[0]["location"];

	afterEach(() => useAuthStore.getState().logout());

	it("sends whoever is signed in to the role's home", async () => {
		signInAs("reviewer");

		await expect(redirectSignedIn()({ location: at() })).rejects.toMatchObject({
			options: { to: "/fila-de-analise" },
		});
	});

	it("lets the visitor and the logout through", async () => {
		await expect(
			redirectSignedIn()({ location: at() }),
		).resolves.toBeUndefined();

		signInAs("user");

		await expect(
			redirectSignedIn()({ location: at({ signingOut: true }) }),
		).resolves.toBeUndefined();
	});
});
