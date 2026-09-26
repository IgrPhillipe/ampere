import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getProject } from "../../../requests";

export const useGetProject = (id: string) =>
	useQuery({
		queryKey: projectKeys.detail(id),
		queryFn: () => getProject(id),
	});
