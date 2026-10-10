import { toSearchParams } from "@features/shared";
import { http } from "@lib/http";

import { ReviewQueueEndpoints as e } from "./endpoints";
import {
	reviewQueueIndicatorsResponseSchema,
	reviewQueueListResponseSchema,
} from "./schemas";
import type { ListReviewQueueParams } from "./types";

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
