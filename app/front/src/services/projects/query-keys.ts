import type { ListProjectsParams } from "./types";

export const projectKeys = {
	all: () => ["projects"] as const,
	lists: () => [...projectKeys.all(), "list"] as const,
	list: (params: ListProjectsParams = {}) =>
		[...projectKeys.lists(), params] as const,
	statusCounts: () => [...projectKeys.all(), "status-counts"] as const,
	municipalities: () => [...projectKeys.all(), "municipalities"] as const,
	details: () => [...projectKeys.all(), "detail"] as const,
	detail: (id: string) => [...projectKeys.details(), id] as const,
};
