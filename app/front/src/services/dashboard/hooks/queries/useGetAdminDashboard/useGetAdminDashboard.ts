import { useQuery } from "@tanstack/react-query";

import { dashboardKeys } from "../../../query-keys";
import { getAdminDashboard } from "../../../requests";

export const useGetAdminDashboard = () =>
	useQuery({
		queryKey: dashboardKeys.admin(),
		queryFn: () => getAdminDashboard(),
	});
