import { nextPage } from "@features/shared";
import { useInfiniteQuery } from "@tanstack/react-query";

import { userKeys } from "../../../query-keys";
import { getUserList } from "../../../requests";

const PAGE_SIZE = 20;

interface UseGetDesignerInfiniteListOptions {
	search?: string;
	enabled?: boolean;
}

/** The active designers an administrator can create a project for. */
export const useGetDesignerInfiniteList = ({
	search = "",
	enabled = true,
}: UseGetDesignerInfiniteListOptions = {}) =>
	useInfiniteQuery({
		queryKey: userKeys.list({ role: "user", active: true, search }),
		queryFn: ({ pageParam }) =>
			getUserList({
				role: "user",
				active: true,
				search: search || undefined,
				page: pageParam,
				pageSize: PAGE_SIZE,
			}),
		initialPageParam: 1,
		getNextPageParam: ({ pagination }) => nextPage(pagination),
		enabled,
	});
