import { useQuery } from "@tanstack/react-query";

import { normativeTableKeys } from "../../../query-keys";
import { getNormativeTableCodes } from "../../../requests";

export const useGetNormativeTableCodes = () =>
	useQuery({
		queryKey: normativeTableKeys.codes(),
		queryFn: getNormativeTableCodes,
		staleTime: Number.POSITIVE_INFINITY,
	});
