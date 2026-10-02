export const ProjectEndpoints = {
	list: "projects",
	create: "projects",
	statusCounts: "projects/status-counts",
	detail: (id: string) => `projects/${id}`,
	update: (id: string) => `projects/${id}`,
	submit: (id: string) => `projects/${id}/submit`,
	uploadDocument: (id: string, docType: string) =>
		`projects/${id}/documents/${docType}`,
} as const;
