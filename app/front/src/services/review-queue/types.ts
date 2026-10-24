import type { SortDirection } from "@features/shared";
import type { BrazilianState } from "@services/locations";

import type { ReviewQueueFilter, ReviewQueueSort } from "./schemas";

export interface ListReviewQueueParams {
	page?: number;
	pageSize?: number;
	search?: string;
	filter?: ReviewQueueFilter;
	sort?: ReviewQueueSort;
	direction?: SortDirection;
	/** An analyst id, or `UNASSIGNED_REVIEWER`. */
	reviewer?: string;
	state?: BrazilianState[];
	municipality?: string[];
}
