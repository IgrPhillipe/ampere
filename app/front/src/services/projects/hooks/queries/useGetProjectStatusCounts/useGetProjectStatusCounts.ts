import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjectStatusCounts } from "../../../requests";

/** Contadores globais da barra de filtros. */
export const useGetProjectStatusCounts = () =>
	useQuery({
		queryKey: projectKeys.statusCounts(),
		queryFn: getProjectStatusCounts,
	});
