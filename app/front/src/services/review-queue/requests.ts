import { toSearchParams } from "@features/shared";
import { http } from "@lib/http";

import { ReviewQueueEndpoints as e } from "./endpoints";
import {
	queueOwnerListResponseSchema,
	reviewerListResponseSchema,
	reviewQueueIndicatorsResponseSchema,
	reviewQueueListResponseSchema,
} from "./schemas";
import type { ListQueueOwnersParams, ListReviewQueueParams } from "./types";

export const getReviewQueue = async (params: ListReviewQueueParams = {}) => {
	const response = await http
		.get(e.list, { searchParams: toSearchParams({ ...params }) })
		.json<unknown>();

	return reviewQueueListResponseSchema.parse(response);
};

export const getReviewQueueIndicators = async () => {
	const response = await http.get(e.indicators).json<unknown>();

	return reviewQueueIndicatorsResponseSchema.parse(response);
};

export const getReviewerList = async () => {
	const response = await http.get(e.reviewers).json<unknown>();

	return reviewerListResponseSchema.parse(response);
};

export const getQueueOwnerList = async (params: ListQueueOwnersParams = {}) => {
	const response = await http
		.get(e.owners, { searchParams: toSearchParams({ ...params }) })
		.json<unknown>();

	return queueOwnerListResponseSchema.parse(response);
};
