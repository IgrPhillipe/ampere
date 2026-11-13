import type { CompareProjectVersionsParams } from "./types";

export const projectVersionKeys = {
	all: () => ["project-versions"] as const,
	project: (projectId: string) =>
		[...projectVersionKeys.all(), projectId] as const,
	list: (projectId: string) =>
		[...projectVersionKeys.project(projectId), "list"] as const,
	compare: ({ projectId, from, to }: CompareProjectVersionsParams) =>
		[...projectVersionKeys.project(projectId), "compare", from, to] as const,
};
