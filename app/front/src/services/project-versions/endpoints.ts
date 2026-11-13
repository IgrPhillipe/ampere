export const ProjectVersionEndpoints = {
	list: (projectId: string) => `projects/${projectId}/versions`,
	memorial: (projectId: string, version: number) =>
		`projects/${projectId}/versions/${version}/memorial`,
	compare: (projectId: string) => `projects/${projectId}/versions/compare`,
	/** Public: no session needed. */
	verifyCode: (code: string) =>
		`memorial-verifications/${encodeURIComponent(code)}`,
	verifyFile: "memorial-verifications",
} as const;
