export const ConsumerUnitGroupEndpoints = {
	list: (projectId: string) => `projects/${projectId}/groups`,
	create: (projectId: string) => `projects/${projectId}/groups`,
	detail: (projectId: string, groupId: string) =>
		`projects/${projectId}/groups/${groupId}`,
	validation: (projectId: string) => `projects/${projectId}/groups/validation`,
} as const;
