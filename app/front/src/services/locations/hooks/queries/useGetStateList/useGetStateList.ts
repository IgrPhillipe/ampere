import { useQuery } from "@tanstack/react-query";

import { locationKeys } from "../../../query-keys";
import { getStateList } from "../../../requests";

export const useGetStateList = () =>
	useQuery({
		queryKey: locationKeys.states(),
		queryFn: getStateList,
		staleTime: Number.POSITIVE_INFINITY,
	});
