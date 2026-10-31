import type { SortDirection } from "@features/shared";

export interface ProjectEventListParams {
	/** `DESC` lists the most recent event first, the API's default. */
	direction?: SortDirection;
}
