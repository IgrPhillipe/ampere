/** Pagination metadata, present on list responses. */
export interface Pagination {
	total: number;
	page: number;
	pageSize: number;
}

/** Standard envelope returned by API endpoints. */
export interface ApiResponse<T> {
	data: T;
	pagination?: Pagination;
}
