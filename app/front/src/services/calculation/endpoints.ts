export const CalculationEndpoints = {
	create: (projectId: string) => `projects/${projectId}/calculations`,
	latest: (projectId: string) => `projects/${projectId}/calculations/latest`,
	spreadsheet: (projectId: string) => `projects/${projectId}/calculation.xlsx`,
} as const;
