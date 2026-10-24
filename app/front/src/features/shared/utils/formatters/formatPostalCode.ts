export const formatPostalCode = (value: string) => {
	const digits = value.replace(/\D/g, "");

	return digits.length === 8
		? `${digits.slice(0, 5)}-${digits.slice(5)}`
		: digits;
};

export const formatPlace = (municipality: string, state: string) =>
	`${municipality}/${state}`;
