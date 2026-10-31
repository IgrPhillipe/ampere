import { useQuery } from "@tanstack/react-query";

import { projectEventKeys } from "../../../query-keys";
import { getProjectRework } from "../../../requests";

export const useGetProjectRework = (projectId: string) =>
	useQuery({
		queryKey: projectEventKeys.rework(projectId),
		queryFn: () => getProjectRework(projectId),
	});
