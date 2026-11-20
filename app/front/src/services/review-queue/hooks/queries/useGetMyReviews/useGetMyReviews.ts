import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { reviewQueueKeys } from "../../../query-keys";
import { getMyReviews } from "../../../requests";
import type { ListMyReviewsParams } from "../../../types";

export const useGetMyReviews = (params: ListMyReviewsParams = {}) =>
	useQuery({
		queryKey: reviewQueueKeys.mine(params),
		queryFn: () => getMyReviews(params),
		placeholderData: keepPreviousData,
	});
