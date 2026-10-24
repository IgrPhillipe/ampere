export const locationKeys = {
	all: () => ["locations"] as const,
	postalCode: (postalCode: string) =>
		[...locationKeys.all(), "postal-code", postalCode] as const,
};
