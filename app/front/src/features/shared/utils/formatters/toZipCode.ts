export const toZipCode = (value?: string | null): string => {
	if (!value) return "-";

	const digits = value.replace(/\D/g, "");

	if (digits.length === 8) {
		return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
	}

	return value;
};
