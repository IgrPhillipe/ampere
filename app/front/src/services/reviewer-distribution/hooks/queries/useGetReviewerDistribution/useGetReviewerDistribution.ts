import { useQuery } from "@tanstack/react-query";

import { reviewerDistributionKeys } from "../../../query-keys";
import { getReviewerDistribution } from "../../../requests";

export const useGetReviewerDistribution = () =>
	useQuery({
		queryKey: reviewerDistributionKeys.list(),
		queryFn: getReviewerDistribution,
	});
