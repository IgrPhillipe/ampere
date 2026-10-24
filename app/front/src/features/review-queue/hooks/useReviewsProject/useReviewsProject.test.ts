import type { ProjectStatus } from "@services/projects";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
	loadedQuery,
	makeProjectDetail,
	signInAs,
} from "@/test/fixtures/project-detail";

import { useReviewsProject } from "./useReviewsProject";

const state = vi.hoisted(() => ({
	status: "UNDER_REVIEW" as ProjectStatus,
	ownerId: "2",
}));

vi.mock("@services/projects", async (importOriginal) => ({
	...(await importOriginal<typeof import("@services/projects")>()),
	useGetProject: () =>
		loadedQuery({
			data: makeProjectDetail({ status: state.status, ownerId: state.ownerId }),
		}),
}));

const reviews = (status: ProjectStatus, ownerId = "2") => {
	state.status = status;
	state.ownerId = ownerId;

	return renderHook(() => useReviewsProject("4")).result.current;
};

describe("useReviewsProject", () => {
	it("opens a submitted project with the review panel for the analyst", () => {
		signInAs("reviewer");

		expect(reviews("UNDER_REVIEW")).toBe(true);
		expect(reviews("APPROVED")).toBe(true);
		expect(reviews("REJECTED")).toBe(true);
	});

	it("keeps the designer's view of a draft and of the admin's own project", () => {
		signInAs("admin");

		expect(reviews("DRAFT")).toBe(false);
		expect(reviews("UNDER_REVIEW", "1")).toBe(false);
		expect(reviews("UNDER_REVIEW")).toBe(true);
	});

	it("never opens the review panel for the designer", () => {
		signInAs("user");

		expect(reviews("UNDER_REVIEW")).toBe(false);
	});
});
