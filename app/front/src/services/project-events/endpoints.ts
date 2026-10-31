export const ProjectEventsEndpoints = {
	events: (projectId: string) => `projects/${projectId}/events`,
	rework: (projectId: string) => `projects/${projectId}/rework`,
} as const;
