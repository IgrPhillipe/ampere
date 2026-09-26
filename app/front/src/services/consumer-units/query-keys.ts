export const consumerUnitGroupKeys = {
	all: () => ["consumer-unit-groups"] as const,
	project: (projectId: string) =>
		[...consumerUnitGroupKeys.all(), projectId] as const,
	list: (projectId: string) =>
		[...consumerUnitGroupKeys.project(projectId), "list"] as const,
	validation: (projectId: string) =>
		[...consumerUnitGroupKeys.project(projectId), "validation"] as const,
};
