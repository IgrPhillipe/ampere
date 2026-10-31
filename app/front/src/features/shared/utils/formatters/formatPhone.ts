/** Formats phone number as (XX) XXXXX-XXXX or (XX) XXXX-XXXX */
export const formatPhone = (value: string): string => {
	const digits = value.replace(/\D/g, "").slice(0, 11);

	if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : "";
	if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	if (digits.length <= 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}
	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};
