import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { reviewQueueKeys } from "../../../query-keys";
import { getReviewQueue } from "../../../requests";
import type { ListReviewQueueParams } from "../../../types";

export const useGetReviewQueue = (params: ListReviewQueueParams = {}) =>
	useQuery({
		queryKey: reviewQueueKeys.list(params),
		queryFn: () => getReviewQueue(params),
		placeholderData: keepPreviousData,
	});
