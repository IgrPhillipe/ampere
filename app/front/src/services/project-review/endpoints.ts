export const ProjectReviewEndpoints = {
	assignment: (projectId: string) => `projects/${projectId}/review`,
	decision: (projectId: string) => `projects/${projectId}/decision`,
	findings: (projectId: string) => `projects/${projectId}/findings`,
	finding: (projectId: string, findingId: string) =>
		`projects/${projectId}/findings/${findingId}`,
	resolution: (projectId: string, findingId: string) =>
		`projects/${projectId}/findings/${findingId}/resolution`,
	response: (projectId: string, findingId: string) =>
		`projects/${projectId}/findings/${findingId}/response`,
	documentFile: (projectId: string, documentId: string) =>
		`projects/${projectId}/documents/${documentId}/file`,
} as const;
