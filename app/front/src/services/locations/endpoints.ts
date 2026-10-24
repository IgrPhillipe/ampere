const IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export const LocationEndpoints = {
	municipalities: (state: string) =>
		`${IBGE}/estados/${state}/municipios?orderBy=nome`,
	postalCode: (postalCode: string) =>
		`https://viacep.com.br/ws/${postalCode}/json/`,
} as const;
