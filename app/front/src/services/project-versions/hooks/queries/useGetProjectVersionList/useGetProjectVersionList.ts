import { useQuery } from "@tanstack/react-query";

import { projectVersionKeys } from "../../../query-keys";
import { getProjectVersionList } from "../../../requests";

export const useGetProjectVersionList = (
	projectId: string,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: projectVersionKeys.list(projectId),
		queryFn: () => getProjectVersionList(projectId),
		enabled,
	});
