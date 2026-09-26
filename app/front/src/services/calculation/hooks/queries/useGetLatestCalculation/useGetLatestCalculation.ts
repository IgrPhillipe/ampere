import { useQuery } from "@tanstack/react-query";

import { calculationKeys } from "../../../query-keys";
import { getLatestCalculation } from "../../../requests";

export const useGetLatestCalculation = (
	projectId: string,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: calculationKeys.latest(projectId),
		queryFn: () => getLatestCalculation(projectId),
		enabled,
		retry: false,
	});
