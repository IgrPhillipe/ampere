export const parseNumber = (value: string | undefined): number => {
	if (!value) return 0;

	const parsedValue = Number(
		value
			.replaceAll(".", "")
			.replaceAll(",", ".")
			.replace(/[^0-9,.]/g, ""),
	);

	if (isNaN(parsedValue)) return 0;

	return parsedValue;
};
