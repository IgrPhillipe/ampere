import { useQuery } from "@tanstack/react-query";

import { submissionKeys } from "../../../query-keys";
import { getMemorial } from "../../../requests";

export const useGetMemorial = (
	projectId: string,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: submissionKeys.memorial(projectId),
		queryFn: () => getMemorial(projectId),
		enabled,
		retry: false,
		staleTime: 0,
	});
