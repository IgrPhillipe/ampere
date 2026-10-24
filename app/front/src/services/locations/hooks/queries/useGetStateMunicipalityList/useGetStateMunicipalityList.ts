import { skipToken, useQuery } from "@tanstack/react-query";

import { locationKeys } from "../../../query-keys";
import { getStateMunicipalityList } from "../../../requests";
import type { BrazilianState } from "../../../schemas";

export const useGetStateMunicipalityList = (state: BrazilianState | null) =>
	useQuery({
		queryKey: locationKeys.municipalities(state ?? ""),
		queryFn: state ? () => getStateMunicipalityList(state) : skipToken,
		staleTime: Number.POSITIVE_INFINITY,
	});
