import type { BrazilianState } from "@services/locations";
import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getMunicipalityList } from "../../../requests";

export const useGetMunicipalityList = (state?: BrazilianState) =>
	useQuery({
		queryKey: projectKeys.municipalities(state),
		queryFn: () => getMunicipalityList(state),
	});
