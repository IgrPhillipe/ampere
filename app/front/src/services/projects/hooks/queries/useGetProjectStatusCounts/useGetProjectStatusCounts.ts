import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjectStatusCounts } from "../../../requests";

export const useGetProjectStatusCounts = () =>
	useQuery({
		queryKey: projectKeys.statusCounts(),
		queryFn: getProjectStatusCounts,
	});
