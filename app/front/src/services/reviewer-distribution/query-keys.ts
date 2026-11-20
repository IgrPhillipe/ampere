export const reviewerDistributionKeys = {
	all: () => ["reviewer-distribution"] as const,
	list: () => [...reviewerDistributionKeys.all(), "list"] as const,
};
