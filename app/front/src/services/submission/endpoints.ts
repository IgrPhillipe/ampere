export const SubmissionEndpoints = {
	memorial: (projectId: string) => `projects/${projectId}/memorial`,
	submission: (projectId: string) => `projects/${projectId}/submission`,
	documents: (projectId: string) => `projects/${projectId}/documents`,
	document: (projectId: string, documentId: string) =>
		`projects/${projectId}/documents/${documentId}`,
} as const;
