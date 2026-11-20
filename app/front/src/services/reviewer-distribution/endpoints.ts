export const ReviewerDistributionEndpoints = {
	list: "reviewers/municipalities",
	municipalities: (reviewerId: string) =>
		`reviewers/${reviewerId}/municipalities`,
	assignment: "review-queue/assignment",
} as const;
