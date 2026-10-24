import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { normativeTableKeys } from "../../../query-keys";
import { getNormativeTableList } from "../../../requests";
import type { ListNormativeTablesParams } from "../../../types";

export const useGetNormativeTableList = (
	params: ListNormativeTablesParams = {},
) =>
	useQuery({
		queryKey: normativeTableKeys.list(params),
		queryFn: () => getNormativeTableList(params),
		// Keeps the rows on screen while a new search or filter loads.
		placeholderData: keepPreviousData,
	});
