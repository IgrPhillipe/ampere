export const ProjectVersionEndpoints = {
	list: (projectId: string) => `projects/${projectId}/versions`,
	/** Public: no session needed. */
	verifyCode: (code: string) =>
		`memorial-verifications/${encodeURIComponent(code)}`,
	verifyFile: "memorial-verifications",
} as const;
