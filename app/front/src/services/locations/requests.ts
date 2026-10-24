import { externalHttp } from "@lib/http";

import { LocationEndpoints as e } from "./endpoints";
import { type PostalCodeAddress, postalCodeAddressSchema } from "./schemas";

/** `null` when ViaCEP does not know the CEP. */
export const getPostalCodeAddress = async (
	postalCode: string,
): Promise<PostalCodeAddress | null> => {
	const response = await externalHttp
		.get(e.postalCode(postalCode))
		.json<unknown>();
	const address = postalCodeAddressSchema.parse(response);

	return "erro" in address ? null : address;
};
