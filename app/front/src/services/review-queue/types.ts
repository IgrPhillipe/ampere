import type { SortDirection } from "@features/shared";

import type { ReviewQueueFilter } from "./schemas";

export interface ListReviewQueueParams {
	page?: number;
	pageSize?: number;
	search?: string;
	filter?: ReviewQueueFilter;
	sort?: SortDirection;
}
