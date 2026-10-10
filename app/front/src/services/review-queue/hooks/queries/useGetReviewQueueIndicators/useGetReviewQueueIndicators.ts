import { useQuery } from "@tanstack/react-query";

import { reviewQueueKeys } from "../../../query-keys";
import { getReviewQueueIndicators } from "../../../requests";

export const useGetReviewQueueIndicators = () =>
	useQuery({
		queryKey: reviewQueueKeys.indicators(),
		queryFn: getReviewQueueIndicators,
	});
