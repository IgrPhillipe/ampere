import type { SortDirection } from "@features/shared";
import type { BrazilianState } from "@services/locations";

import type {
	MyReviewDecision,
	ReviewQueueFilter,
	ReviewQueueSort,
} from "./schemas";

export interface ListReviewQueueParams {
	page?: number;
	pageSize?: number;
	search?: string;
	filter?: ReviewQueueFilter;
	sort?: ReviewQueueSort;
	direction?: SortDirection;
	/** An analyst id, or `UNASSIGNED_REVIEWER`. */
	reviewer?: string;
	/** A designer id. */
	owner?: string;
	state?: BrazilianState[];
	municipality?: string[];
}

export interface ListQueueOwnersParams {
	page?: number;
	pageSize?: number;
	search?: string;
}

export interface ListMyReviewsParams {
	page?: number;
	pageSize?: number;
	/** Protocol, project or designer. */
	search?: string;
	decision?: MyReviewDecision;
	state?: BrazilianState[];
	municipality?: string[];
	/** `YYYY-MM-DD`, inclusive. */
	decidedFrom?: string;
	decidedTo?: string;
}
