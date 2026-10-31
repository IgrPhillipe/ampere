import type { ProjectEventListParams } from "./types";

export const projectEventKeys = {
	all: () => ["project-events"] as const,
	project: (projectId: string) =>
		[...projectEventKeys.all(), projectId] as const,
	list: (projectId: string, params: ProjectEventListParams = {}) =>
		[...projectEventKeys.project(projectId), "list", params] as const,
	rework: (projectId: string) =>
		[...projectEventKeys.project(projectId), "rework"] as const,
};
