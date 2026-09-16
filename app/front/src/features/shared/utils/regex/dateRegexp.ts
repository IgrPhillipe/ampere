export const dateRegexp =
	/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;

export const isValidDate = (value: string): boolean => {
	const isDateFormatValid = new RegExp(dateRegexp).test(value);

	if (!isDateFormatValid) return false;

	const [day, month, year] = value.split("/").map(Number);
	const date = new Date(year, month - 1, day);

	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
};
