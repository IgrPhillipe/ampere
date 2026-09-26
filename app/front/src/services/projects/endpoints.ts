export const ProjectEndpoints = {
	list: "projects",
	create: "projects",
	statusCounts: "projects/status-counts",
	detail: (id: string) => `projects/${id}`,
} as const;
