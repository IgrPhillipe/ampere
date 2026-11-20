import { useQuery } from "@tanstack/react-query";

import { normativeTableKeys } from "../../../query-keys";
import { getNormativeTableRevisions } from "../../../requests";

export const useGetNormativeTableRevisions = (
	id: string,
	{ enabled = true }: { enabled?: boolean } = {},
) =>
	useQuery({
		queryKey: normativeTableKeys.revisions(id),
		queryFn: () => getNormativeTableRevisions(id),
		enabled,
	});
