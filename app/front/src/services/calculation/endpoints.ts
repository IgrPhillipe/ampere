export const CalculationEndpoints = {
	create: (projectId: string) => `projects/${projectId}/calculations`,
	latest: (projectId: string) => `projects/${projectId}/calculations/latest`,
} as const;
