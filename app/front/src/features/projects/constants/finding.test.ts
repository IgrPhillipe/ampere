import type { Finding } from "@services/project-review";
import { describe, expect, it } from "vitest";

import { awaitsDesignerResponse, findingTarget } from "./finding";

const finding = {
	stage: "DOCUMENTS",
	consumerUnitGroupId: null,
	calculationStepCode: null,
	documentType: "ART",
	version: 2,
	status: "OPEN",
} as Finding;

describe("awaitsDesignerResponse", () => {
	it.each([
		["REJECTED", "OPEN", true],
		["REJECTED", "CONTESTED", true],
		["REJECTED", "RESOLVED", false],
		["REJECTED", "DRAFT", false],
		["UNDER_REVIEW", "OPEN", false],
	] as const)("%s project, %s finding: %s", (status, findingStatus, expected) => {
		expect(
			awaitsDesignerResponse({ ...finding, status: findingStatus }, { status }),
		).toBe(expected);
	});

	it("lets the designer answer a finding reopened from an earlier version", () => {
		expect(
			awaitsDesignerResponse(
				{ ...finding, version: 1, status: "OPEN" },
				{ status: "REJECTED" },
			),
		).toBe(true);
	});
});

describe("findingTarget", () => {
	it("points to the item of the finding", () => {
		expect(findingTarget(finding)).toBe("documento-ART");
		expect(
			findingTarget({
				...finding,
				documentType: null,
				consumerUnitGroupId: "7",
			}),
		).toBe("grupo-7");
		expect(findingTarget({ ...finding, documentType: null })).toBeUndefined();
	});
});
