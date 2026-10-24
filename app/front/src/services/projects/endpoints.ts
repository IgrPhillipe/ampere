export const ProjectEndpoints = {
	list: "projects",
	create: "projects",
	statusCounts: "projects/status-counts",
	municipalities: "projects/municipalities",
	owners: "projects/owners",
	detail: (id: string) => `projects/${id}`,
	update: (id: string) => `projects/${id}`,
	remove: (id: string) => `projects/${id}`,
} as const;
