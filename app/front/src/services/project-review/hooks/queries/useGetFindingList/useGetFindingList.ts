import { useQuery } from "@tanstack/react-query";

import { projectReviewKeys } from "../../../query-keys";
import { getFindingList } from "../../../requests";

export const useGetFindingList = (
	projectId: string,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: projectReviewKeys.findings(projectId),
		queryFn: () => getFindingList(projectId),
		enabled,
	});
