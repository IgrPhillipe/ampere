import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { projectEventKeys } from "../../../query-keys";
import { getProjectEventList } from "../../../requests";
import type { ProjectEventListParams } from "../../../types";

/** Keeps the current timeline on screen while the other direction loads. */
export const useGetProjectEventList = (
	projectId: string,
	params: ProjectEventListParams = {},
) =>
	useQuery({
		queryKey: projectEventKeys.list(projectId, params),
		queryFn: () => getProjectEventList(projectId, params),
		placeholderData: keepPreviousData,
	});
