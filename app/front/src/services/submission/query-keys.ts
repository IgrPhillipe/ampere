export const submissionKeys = {
	all: () => ["submission"] as const,
	checklist: (projectId: string) =>
		[...submissionKeys.all(), projectId, "checklist"] as const,
	memorial: (projectId: string) =>
		[...submissionKeys.all(), projectId, "memorial"] as const,
};
