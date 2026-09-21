import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProjectList } from "../../../requests";
import type { ListProjectsParams } from "../../../types";

export const useGetProjectList = (params: ListProjectsParams = {}) =>
	useQuery({
		queryKey: projectKeys.list(params),
		queryFn: () => getProjectList(params),
		// Without it the table empties and the pagination vanishes on every page, filter or search.
		placeholderData: keepPreviousData,
	});
