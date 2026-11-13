import { useQuery } from "@tanstack/react-query";

import { projectVersionKeys } from "../../../query-keys";
import { compareProjectVersions } from "../../../requests";
import type { CompareProjectVersionsParams } from "../../../types";

/** Versions never change, so a comparison stays valid for good. */
export const useCompareProjectVersions = (
	params: CompareProjectVersionsParams,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: projectVersionKeys.compare(params),
		queryFn: () => compareProjectVersions(params),
		enabled,
		staleTime: Number.POSITIVE_INFINITY,
	});
