import type { ProjectStatus } from "@services/projects";
import { describe, expect, it } from "vitest";

import { getProjectPermissions } from "./useProjectPermissions";

const owned = (status: ProjectStatus) => ({ status, ownerId: "1" });
const others = (status: ProjectStatus) => ({ status, ownerId: "2" });

describe("getProjectPermissions", () => {
	it("lets the designer edit a draft or a rejection", () => {
		expect(getProjectPermissions("user", "1", owned("DRAFT")).canEdit).toBe(
			true,
		);
		expect(getProjectPermissions("user", "1", owned("REJECTED")).canEdit).toBe(
			true,
		);
		expect(
			getProjectPermissions("user", "1", owned("AWAITING_SUBMISSION")).canEdit,
		).toBe(false);
		expect(
			getProjectPermissions("user", "1", owned("UNDER_REVIEW")).canEdit,
		).toBe(false);
	});

	it("keeps the documents open until the submission", () => {
		expect(
			getProjectPermissions("user", "1", owned("AWAITING_SUBMISSION"))
				.canEditDocuments,
		).toBe(true);
		expect(
			getProjectPermissions("user", "1", owned("APPROVED")).canEditDocuments,
		).toBe(false);
	});

	it("lets anyone delete only a draft", () => {
		expect(getProjectPermissions("user", "1", owned("DRAFT")).canDelete).toBe(
			true,
		);
		expect(
			getProjectPermissions("admin", "9", others("REJECTED")).canDelete,
		).toBe(false);
	});

	it.each([
		"UNDER_REVIEW",
		"APPROVED",
	] as const)("freezes a project in %s for the admin too", (status) => {
		expect(getProjectPermissions("admin", "9", others(status))).toEqual({
			canEdit: false,
			canEditDocuments: false,
			canDelete: false,
			isOwner: false,
		});
	});

	it("lets the admin edit another designer's draft without owning it", () => {
		expect(getProjectPermissions("admin", "9", others("DRAFT"))).toEqual({
			canEdit: true,
			canEditDocuments: true,
			canDelete: true,
			isOwner: false,
		});
	});

	it("never lets the analyst edit", () => {
		expect(getProjectPermissions("reviewer", "1", owned("DRAFT"))).toEqual({
			canEdit: false,
			canEditDocuments: false,
			canDelete: false,
			isOwner: false,
		});
	});
});
