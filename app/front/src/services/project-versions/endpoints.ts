import type { DocumentType } from "@services/submission";

export const ProjectVersionEndpoints = {
	list: (projectId: string) => `projects/${projectId}/versions`,
	memorial: (projectId: string, version: number) =>
		`projects/${projectId}/versions/${version}/memorial`,
	approvalMemorial: (projectId: string, version: number) =>
		`projects/${projectId}/versions/${version}/approval-memorial`,
	document: (projectId: string, version: number, type: DocumentType) =>
		`projects/${projectId}/versions/${version}/documents/${type}/file`,
	compare: (projectId: string) => `projects/${projectId}/versions/compare`,
	/** Public: no session needed. */
	verifyCode: (code: string) =>
		`memorial-verifications/${encodeURIComponent(code)}`,
	verifyFile: "memorial-verifications",
} as const;
