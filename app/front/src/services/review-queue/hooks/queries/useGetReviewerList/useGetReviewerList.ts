import { useQuery } from "@tanstack/react-query";

import { reviewQueueKeys } from "../../../query-keys";
import { getReviewerList } from "../../../requests";

/** Only the manager reaches the list; the analyst's session leaves it disabled. */
export const useGetReviewerList = ({ enabled = true } = {}) =>
	useQuery({
		queryKey: reviewQueueKeys.reviewers(),
		queryFn: getReviewerList,
		enabled,
	});
