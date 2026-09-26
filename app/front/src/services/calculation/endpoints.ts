export const CalculationEndpoints = {
	calculation: (projectId: string) => `projects/${projectId}/calculation`,
} as const;
