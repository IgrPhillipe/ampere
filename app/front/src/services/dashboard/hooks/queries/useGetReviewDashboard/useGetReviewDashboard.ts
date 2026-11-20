import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { dashboardKeys } from "../../../query-keys";
import { getReviewDashboard } from "../../../requests";
import type { DashboardPeriod } from "../../../schemas";

export const useGetReviewDashboard = (period: DashboardPeriod) =>
	useQuery({
		queryKey: dashboardKeys.review(period),
		queryFn: () => getReviewDashboard(period),
		placeholderData: keepPreviousData,
	});
