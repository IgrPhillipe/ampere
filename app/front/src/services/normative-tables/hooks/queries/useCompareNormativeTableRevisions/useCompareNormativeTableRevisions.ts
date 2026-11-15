import { useQuery } from "@tanstack/react-query";

import { normativeTableKeys } from "../../../query-keys";
import { compareNormativeTableRevisions } from "../../../requests";
import type { CompareNormativeTableRevisionsParams } from "../../../types";

export const useCompareNormativeTableRevisions = (
	params: CompareNormativeTableRevisionsParams,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: normativeTableKeys.compare(params),
		queryFn: () => compareNormativeTableRevisions(params),
		enabled,
	});
