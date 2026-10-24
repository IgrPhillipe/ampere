import { useQueries } from "@tanstack/react-query";

import {
	CONCESSION_STATES,
	type ConcessionState,
	concessionMunicipalities,
	LIMITED_MUNICIPALITIES,
} from "../../../concession";
import { locationKeys } from "../../../query-keys";
import { getStateMunicipalityList } from "../../../requests";

/** Every municipality served in the given states, or in the whole concession when none is given. */
export const useGetConcessionMunicipalityList = (
	states: readonly ConcessionState[] = [],
) => {
	const scope = states.length ? states : CONCESSION_STATES;

	return useQueries({
		// A state served in a few municipalities needs no request for the rest of them.
		queries: scope.map((state) => {
			const limited = LIMITED_MUNICIPALITIES[state];

			return {
				queryKey: locationKeys.municipalities(state),
				queryFn: limited
					? () => Promise.resolve([...limited])
					: () => getStateMunicipalityList(state),
				staleTime: Number.POSITIVE_INFINITY,
				select: (names: string[]) => concessionMunicipalities(state, names),
			};
		}),
		combine: (results) => ({
			municipalities: results
				.flatMap((result) => result.data ?? [])
				.sort((a, b) => a.localeCompare(b, "pt-BR")),
			isPending: results.some((result) => result.isPending),
		}),
	});
};
