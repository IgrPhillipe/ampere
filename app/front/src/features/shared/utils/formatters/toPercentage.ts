export const toPercentage = (
	value: number,
	options?: Intl.NumberFormatOptions,
) => {
	const formatter = new Intl.NumberFormat("pt-BR", {
		style: "percent",
		...options,
	});

	return formatter.format(value);
};
