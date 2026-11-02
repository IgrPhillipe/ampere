import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { dashboardKeys } from "../../../query-keys";
import { getDesignerDashboard } from "../../../requests";
import type { DashboardPeriod } from "../../../schemas";

export const useGetDesignerDashboard = (period: DashboardPeriod) =>
	useQuery({
		queryKey: dashboardKeys.designer(period),
		queryFn: () => getDesignerDashboard(period),
		placeholderData: keepPreviousData,
	});
