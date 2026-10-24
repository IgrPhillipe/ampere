import type { Finding } from "@services/project-review";
import { describe, expect, it } from "vitest";

import {
	awaitsDesignerResponse,
	findingStatusLabelOf,
	findingTarget,
} from "./finding";

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
		["REJECTED", "CONTESTED", false],
		["REJECTED", "FIXED", false],
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

describe("findingStatusLabelOf", () => {
	it("calls a finding reopened after the designer's answer", () => {
		expect(
			findingStatusLabelOf({
				status: "OPEN",
				respondedAt: "2026-09-24T12:00:00Z",
			}),
		).toBe("Reaberto");
		expect(findingStatusLabelOf({ status: "OPEN", respondedAt: null })).toBe(
			"Aberto",
		);
		expect(
			findingStatusLabelOf({
				status: "FIXED",
				respondedAt: "2026-09-24T12:00:00Z",
			}),
		).toBe("Corrigido");
	});
});
