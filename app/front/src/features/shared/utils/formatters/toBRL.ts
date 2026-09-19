export const toBRL = (
	value: number,
	options?: Intl.NumberFormatOptions,
): string => {
	const formatter = new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
		...options,
	});

	return formatter.format(value);
};
