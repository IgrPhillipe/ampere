import { nextPage } from "@features/shared";
import { useInfiniteQuery } from "@tanstack/react-query";

import { reviewQueueKeys } from "../../../query-keys";
import { getQueueOwnerList } from "../../../requests";

const PAGE_SIZE = 20;

interface UseGetQueueOwnerInfiniteListOptions {
	search?: string;
	enabled?: boolean;
}

export const useGetQueueOwnerInfiniteList = ({
	search = "",
	enabled = true,
}: UseGetQueueOwnerInfiniteListOptions = {}) =>
	useInfiniteQuery({
		queryKey: reviewQueueKeys.ownerList({ search }),
		queryFn: ({ pageParam }) =>
			getQueueOwnerList({
				search: search || undefined,
				page: pageParam,
				pageSize: PAGE_SIZE,
			}),
		initialPageParam: 1,
		getNextPageParam: ({ pagination }) => nextPage(pagination),
		enabled,
	});
