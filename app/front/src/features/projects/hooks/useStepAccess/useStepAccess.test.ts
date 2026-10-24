import type { ProjectStatus } from "@services/projects";
import { describe, expect, it } from "vitest";

import { getProjectPermissions } from "../useProjectPermissions";
import { getStepAccess, type ProjectStep } from "./useStepAccess";

const steps: ProjectStep[] = ["dados", "unidades", "calculo", "memorial"];

const accessOf = (
	step: ProjectStep,
	status: ProjectStatus,
	role: "user" | "admin" = "user",
	ownerId = "1",
) => getStepAccess(step, getProjectPermissions(role, "1", { status, ownerId }));

describe("getStepAccess", () => {
	it("opens every step of a draft or a rejection", () => {
		for (const status of ["DRAFT", "REJECTED"] as const) {
			for (const step of steps) {
				expect(accessOf(step, status)).toEqual({ allowed: true });
			}
		}
	});

	it("lets the admin edit a project someone else owns", () => {
		expect(accessOf("unidades", "REJECTED", "admin", "2")).toEqual({
			allowed: true,
		});
	});

	it("sends a project under review or approved to the matching detail tab", () => {
		for (const status of ["UNDER_REVIEW", "APPROVED"] as const) {
			expect(accessOf("dados", status)).toEqual({ allowed: false, tab: null });
			expect(accessOf("unidades", status)).toEqual({
				allowed: false,
				tab: "unidades",
			});
			expect(accessOf("calculo", status)).toEqual({
				allowed: false,
				tab: "memoria",
			});
			expect(accessOf("memorial", status)).toEqual({
				allowed: false,
				tab: "memorial",
			});
		}
	});

	it("keeps only the memorial open while a project awaits its submission", () => {
		expect(accessOf("memorial", "AWAITING_SUBMISSION")).toEqual({
			allowed: true,
		});
		expect(accessOf("calculo", "AWAITING_SUBMISSION")).toEqual({
			allowed: false,
			tab: "memoria",
		});
	});
});
