export const locationKeys = {
	all: () => ["locations"] as const,
	municipalities: (state: string) =>
		[...locationKeys.all(), "municipalities", state] as const,
	postalCode: (postalCode: string) =>
		[...locationKeys.all(), "postal-code", postalCode] as const,
};
