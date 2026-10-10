export const ConsumerUnitGroupEndpoints = {
	list: (projectId: string) => `projects/${projectId}/consumer-unit-groups`,
	create: (projectId: string) => `projects/${projectId}/consumer-unit-groups`,
	detail: (projectId: string, groupId: string) =>
		`projects/${projectId}/consumer-unit-groups/${groupId}`,
	validation: (projectId: string) =>
		`projects/${projectId}/consumer-unit-groups/validation`,
} as const;
