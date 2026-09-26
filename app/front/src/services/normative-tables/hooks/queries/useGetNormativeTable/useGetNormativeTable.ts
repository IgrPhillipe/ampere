import { useQuery } from "@tanstack/react-query";

import { normativeTableKeys } from "../../../query-keys";
import { getNormativeTable } from "../../../requests";

interface UseGetNormativeTableOptions {
	enabled?: boolean;
}

export const useGetNormativeTable = (
	id: string,
	{ enabled = true }: UseGetNormativeTableOptions = {},
) =>
	useQuery({
		queryKey: normativeTableKeys.detail(id),
		queryFn: () => getNormativeTable(id),
		enabled,
	});
