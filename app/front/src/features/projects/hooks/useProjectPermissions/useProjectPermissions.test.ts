import { describe, expect, it } from "vitest";

import { getProjectPermissions } from "./useProjectPermissions";

describe("getProjectPermissions", () => {
	it("lets the designer edit a draft or a rejection", () => {
		expect(getProjectPermissions("user", "DRAFT").canEdit).toBe(true);
		expect(getProjectPermissions("user", "REJECTED").canEdit).toBe(true);
		expect(getProjectPermissions("user", "AWAITING_SUBMISSION").canEdit).toBe(
			false,
		);
		expect(getProjectPermissions("user", "UNDER_REVIEW").canEdit).toBe(false);
	});

	it("lets the designer delete only a draft", () => {
		expect(getProjectPermissions("user", "DRAFT").canDelete).toBe(true);
		expect(getProjectPermissions("user", "REJECTED").canDelete).toBe(false);
	});

	it("keeps the documents open to the designer until the submission", () => {
		expect(
			getProjectPermissions("user", "AWAITING_SUBMISSION").canEditDocuments,
		).toBe(true);
		expect(getProjectPermissions("user", "REJECTED").canEditDocuments).toBe(
			true,
		);
		expect(getProjectPermissions("user", "APPROVED").canEditDocuments).toBe(
			false,
		);
	});

	it.each([
		"DRAFT",
		"AWAITING_SUBMISSION",
		"UNDER_REVIEW",
		"REJECTED",
		"APPROVED",
	] as const)("lets the admin edit a project in %s", (status) => {
		expect(getProjectPermissions("admin", status)).toEqual({
			canEdit: true,
			canEditDocuments: true,
			canDelete: true,
			canEditInAnyStatus: true,
		});
	});

	it("never lets the analyst edit", () => {
		expect(getProjectPermissions("reviewer", "DRAFT")).toEqual({
			canEdit: false,
			canEditDocuments: false,
			canDelete: false,
			canEditInAnyStatus: false,
		});
	});
});
