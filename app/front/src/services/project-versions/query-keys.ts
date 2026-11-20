export const projectVersionKeys = {
	all: () => ["project-versions"] as const,
	project: (projectId: string) =>
		[...projectVersionKeys.all(), projectId] as const,
	list: (projectId: string) =>
		[...projectVersionKeys.project(projectId), "list"] as const,
};
