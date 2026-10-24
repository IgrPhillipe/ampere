import { useQuery } from "@tanstack/react-query";

import { projectKeys } from "../../../query-keys";
import { getMunicipalityList } from "../../../requests";

export const useGetMunicipalityList = () =>
	useQuery({
		queryKey: projectKeys.municipalities(),
		queryFn: getMunicipalityList,
	});
