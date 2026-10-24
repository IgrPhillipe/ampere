import { nextPage } from "@features/shared";
import { useInfiniteQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjectOwnerList } from "../../../requests";

const PAGE_SIZE = 20;

interface UseGetProjectOwnerInfiniteListOptions {
	search?: string;
	enabled?: boolean;
}

export const useGetProjectOwnerInfiniteList = ({
	search = "",
	enabled = true,
}: UseGetProjectOwnerInfiniteListOptions = {}) =>
	useInfiniteQuery({
		queryKey: projectKeys.ownerList({ search }),
		queryFn: ({ pageParam }) =>
			getProjectOwnerList({
				search: search || undefined,
				page: pageParam,
				pageSize: PAGE_SIZE,
			}),
		initialPageParam: 1,
		getNextPageParam: ({ pagination }) => nextPage(pagination),
		enabled,
	});
