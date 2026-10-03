export const SubmissionEndpoints = {
	memorial: (projectId: string) => `projects/${projectId}/memorial`,
	submission: (projectId: string) => `projects/${projectId}/submission`,
	submit: (projectId: string) => `projects/${projectId}/submit`,
	documents: (projectId: string) => `projects/${projectId}/documents`,
	document: (projectId: string, documentId: string) =>
		`projects/${projectId}/documents/${documentId}`,
} as const;
