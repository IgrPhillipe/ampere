import { externalHttp } from "@lib/http";

import { LocationEndpoints as e } from "./endpoints";
import {
	type BrazilianState,
	municipalityListSchema,
	type PostalCodeAddress,
	postalCodeAddressSchema,
	stateListSchema,
} from "./schemas";

export const getStateList = async () => {
	const response = await externalHttp.get(e.states).json<unknown>();

	return stateListSchema.parse(response);
};

export const getStateMunicipalityList = async (state: BrazilianState) => {
	const response = await externalHttp
		.get(e.municipalities(state))
		.json<unknown>();

	return municipalityListSchema.parse(response).map(({ nome }) => nome);
};

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
