import type { Pagination } from "../../schemas";

/** The page `useInfiniteQuery` asks for next, or `undefined` after the last one. */
export const nextPage = ({ page, pageSize, total }: Pagination) =>
	page * pageSize < total ? page + 1 : undefined;
