import { describe, expect, it } from "vitest";

import {
	getProjectDetailActions,
	getProjectProfile,
} from "./project-detail-actions";

const enabled = (actions: Record<string, boolean>) =>
	Object.entries(actions)
		.filter(([, value]) => value)
		.map(([action]) => action);

describe("getProjectDetailActions", () => {
	it("lets the designer answer findings and resubmit a rejected project", () => {
		expect(
			enabled(
				getProjectDetailActions({ profile: "designer", status: "REJECTED" }),
			),
		).toEqual(["respondFindings", "resubmit"]);
	});

	it("gives the designer nothing to do while the project is under review", () => {
		expect(
			enabled(
				getProjectDetailActions({
					profile: "designer",
					status: "UNDER_REVIEW",
					holdsReview: true,
				}),
			),
		).toEqual([]);
	});

	it("lets the reviewer record findings and decide only the review they hold", () => {
		expect(
			enabled(
				getProjectDetailActions({
					profile: "reviewer",
					status: "UNDER_REVIEW",
					holdsReview: true,
				}),
			),
		).toEqual(["createFindings", "decide"]);
		expect(
			enabled(
				getProjectDetailActions({
					profile: "reviewer",
					status: "UNDER_REVIEW",
				}),
			),
		).toEqual([]);
	});

	it("gives the admin the reviewer actions plus edit and delete", () => {
		expect(
			enabled(
				getProjectDetailActions({
					profile: "admin",
					status: "UNDER_REVIEW",
					holdsReview: true,
				}),
			),
		).toEqual(["createFindings", "decide", "edit", "delete"]);
		expect(
			enabled(
				getProjectDetailActions({ profile: "admin", status: "REJECTED" }),
			),
		).toEqual(["edit", "delete"]);
	});

	it("offers nothing without a session or a loaded project", () => {
		expect(
			enabled(
				getProjectDetailActions({ profile: undefined, status: "REJECTED" }),
			),
		).toEqual([]);
		expect(
			enabled(getProjectDetailActions({ profile: "admin", status: undefined })),
		).toEqual([]);
	});
});

describe("getProjectProfile", () => {
	it("keeps the session admin as the reviewer until it gets full access", () => {
		expect(getProjectProfile("user")).toBe("designer");
		expect(getProjectProfile("admin")).toBe("reviewer");
	});
});
