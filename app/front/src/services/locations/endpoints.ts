export const LocationEndpoints = {
	postalCode: (postalCode: string) =>
		`https://viacep.com.br/ws/${postalCode}/json/`,
} as const;
