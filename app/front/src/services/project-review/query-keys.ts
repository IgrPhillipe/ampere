export const projectReviewKeys = {
	all: () => ["project-review"] as const,
	findings: (projectId: string) =>
		[...projectReviewKeys.all(), projectId, "findings"] as const,
	documentFile: (projectId: string, documentId: string) =>
		[...projectReviewKeys.all(), projectId, "document", documentId] as const,
};
