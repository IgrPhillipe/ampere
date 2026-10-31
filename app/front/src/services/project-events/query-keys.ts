import { projectKeys } from "@services/projects";

import type { ProjectEventListParams } from "./types";

/** Under the project's detail, so every mutation that refreshes the project refreshes its history too. */
export const projectEventKeys = {
	project: (projectId: string) =>
		[...projectKeys.detail(projectId), "events"] as const,
	list: (projectId: string, params: ProjectEventListParams = {}) =>
		[...projectEventKeys.project(projectId), "list", params] as const,
	rework: (projectId: string) =>
		[...projectEventKeys.project(projectId), "rework"] as const,
};
