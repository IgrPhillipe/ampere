import { skipToken, useQuery } from "@tanstack/react-query";

import { locationKeys } from "../../../query-keys";
import { getPostalCodeAddress } from "../../../requests";

/** Runs only for a complete CEP: eight digits, no mask. */
export const useGetPostalCodeAddress = (postalCode: string) =>
	useQuery({
		queryKey: locationKeys.postalCode(postalCode),
		queryFn: /^\d{8}$/.test(postalCode)
			? () => getPostalCodeAddress(postalCode)
			: skipToken,
		staleTime: Number.POSITIVE_INFINITY,
	});
