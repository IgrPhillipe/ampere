export const calculationKeys = {
	all: () => ["calculation"] as const,
	latest: (projectId: string) =>
		[...calculationKeys.all(), projectId, "latest"] as const,
};
