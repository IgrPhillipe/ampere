import { useQuery } from "@tanstack/react-query";

import { projectVersionKeys } from "../../../query-keys";
import { getProjectVersionList } from "../../../requests";

export const useGetProjectVersionList = (projectId: string) =>
	useQuery({
		queryKey: projectVersionKeys.list(projectId),
		queryFn: () => getProjectVersionList(projectId),
	});
