import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { userKeys } from "../../../query-keys";
import { getUserList } from "../../../requests";
import type { ListUsersParams } from "../../../types";

export const useGetUserList = (params: ListUsersParams = {}) =>
	useQuery({
		queryKey: userKeys.list(params),
		queryFn: () => getUserList(params),
		placeholderData: keepPreviousData,
	});
