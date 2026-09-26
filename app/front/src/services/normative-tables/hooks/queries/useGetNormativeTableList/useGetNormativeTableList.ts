import { useQuery } from "@tanstack/react-query";

import { normativeTableKeys } from "../../../query-keys";
import { getNormativeTableList } from "../../../requests";

export const useGetNormativeTableList = () =>
	useQuery({
		queryKey: normativeTableKeys.list(),
		queryFn: getNormativeTableList,
	});
