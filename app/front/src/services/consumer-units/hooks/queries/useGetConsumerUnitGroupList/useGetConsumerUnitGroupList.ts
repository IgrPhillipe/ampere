import { useQuery } from "@tanstack/react-query";

import { consumerUnitGroupKeys } from "../../../query-keys";
import { getConsumerUnitGroupList } from "../../../requests";

export const useGetConsumerUnitGroupList = (projectId: string) =>
	useQuery({
		queryKey: consumerUnitGroupKeys.list(projectId),
		queryFn: () => getConsumerUnitGroupList(projectId),
	});
