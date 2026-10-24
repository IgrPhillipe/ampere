/** Masks as the user types: `50030`, then `50030-2`, up to `50030-230`. */
export const formatPostalCode = (value: string) => {
	const digits = value.replace(/\D/g, "").slice(0, 8);

	return digits.length > 5
		? `${digits.slice(0, 5)}-${digits.slice(5)}`
		: digits;
};
