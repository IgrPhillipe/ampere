import type { ProjectVersion } from "@services/project-versions";
import { describe, expect, it } from "vitest";

import {
	getMemorialStamp,
	latestVersion,
	mayHaveOfficialMemorial,
} from "./memorial-stamp";

const versionOf = (
	number: number,
	overrides: Partial<ProjectVersion> = {},
): ProjectVersion => ({
	number,
	submittedAt: `2026-08-2${number}T12:00:00Z`,
	authorName: "Ana Lima",
	changeSummary: null,
	demandKva: 46,
	documents: [],
	memorialSha256: "a".repeat(64),
	verificationCode: `7F3A-91C2-04BD-2E7${number}`,
	approvalMemorial: null,
	...overrides,
});

describe("mayHaveOfficialMemorial", () => {
	it("follows the API, which renders again only a draft or a rejected project", () => {
		expect(mayHaveOfficialMemorial("DRAFT")).toBe(false);
		expect(mayHaveOfficialMemorial("REJECTED")).toBe(false);
		expect(mayHaveOfficialMemorial("AWAITING_SUBMISSION")).toBe(true);
		expect(mayHaveOfficialMemorial("UNDER_REVIEW")).toBe(true);
		expect(mayHaveOfficialMemorial("APPROVED")).toBe(true);
	});
});

describe("latestVersion", () => {
	it("picks the highest number, whatever the order", () => {
		expect(
			latestVersion([versionOf(2), versionOf(3), versionOf(1)])?.number,
		).toBe(3);
		expect(latestVersion([])).toBeUndefined();
	});
});

describe("getMemorialStamp", () => {
	it("is a preview while the project is editable, even with versions", () => {
		expect(
			getMemorialStamp("REJECTED", [versionOf(1), versionOf(2)]),
		).toBeNull();
		expect(getMemorialStamp("DRAFT", [])).toBeNull();
	});

	it("is a preview for a project never submitted", () => {
		expect(getMemorialStamp("AWAITING_SUBMISSION", [])).toBeNull();
	});

	it("names the latest version and its code once submitted", () => {
		expect(
			getMemorialStamp("UNDER_REVIEW", [
				versionOf(1),
				versionOf(3),
				versionOf(2),
			]),
		).toEqual({
			kind: "submission",
			version: 3,
			verificationCode: "7F3A-91C2-04BD-2E73",
		});
	});

	it("takes the code of the approval memorial, the PDF the API serves", () => {
		const approved = versionOf(1, {
			approvalMemorial: {
				memorialSha256: "b".repeat(64),
				verificationCode: "14AD-9894-877C-3C4A",
				issuedAt: "2026-11-09T22:45:53Z",
			},
		});

		expect(getMemorialStamp("APPROVED", [approved])).toEqual({
			kind: "approval",
			version: 1,
			verificationCode: "14AD-9894-877C-3C4A",
			approvedAt: "2026-11-09T22:45:53Z",
		});
	});
});
