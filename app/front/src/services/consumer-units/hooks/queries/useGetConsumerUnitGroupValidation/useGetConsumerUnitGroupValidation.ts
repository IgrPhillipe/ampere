import { useQuery } from "@tanstack/react-query";

import { consumerUnitGroupKeys } from "../../../query-keys";
import { getConsumerUnitGroupValidation } from "../../../requests";

export const useGetConsumerUnitGroupValidation = (
	projectId: string,
	{ enabled = true } = {},
) =>
	useQuery({
		queryKey: consumerUnitGroupKeys.validation(projectId),
		queryFn: () => getConsumerUnitGroupValidation(projectId),
		enabled,
	});
