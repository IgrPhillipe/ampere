import type { ListQueueOwnersParams, ListReviewQueueParams } from "./types";

export const reviewQueueKeys = {
	all: () => ["review-queue"] as const,
	lists: () => [...reviewQueueKeys.all(), "list"] as const,
	list: (params: ListReviewQueueParams = {}) =>
		[...reviewQueueKeys.lists(), params] as const,
	indicators: () => [...reviewQueueKeys.all(), "indicators"] as const,
	reviewers: () => [...reviewQueueKeys.all(), "reviewers"] as const,
	owners: () => [...reviewQueueKeys.all(), "owners"] as const,
	ownerList: (params: ListQueueOwnersParams = {}) =>
		[...reviewQueueKeys.owners(), params] as const,
};
