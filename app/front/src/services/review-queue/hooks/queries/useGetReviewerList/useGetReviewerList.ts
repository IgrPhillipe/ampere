import { useQuery } from "@tanstack/react-query";

import { reviewQueueKeys } from "../../../query-keys";
import { getReviewerList } from "../../../requests";

export const useGetReviewerList = () =>
	useQuery({
		queryKey: reviewQueueKeys.reviewers(),
		queryFn: getReviewerList,
	});
