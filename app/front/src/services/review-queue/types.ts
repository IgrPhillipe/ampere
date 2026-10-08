import type { ReviewQueueFilter, ReviewQueueSort } from "./schemas";

export interface ListReviewQueueParams {
	page?: number;
	pageSize?: number;
	search?: string;
	filter?: ReviewQueueFilter;
	sort?: ReviewQueueSort;
}
