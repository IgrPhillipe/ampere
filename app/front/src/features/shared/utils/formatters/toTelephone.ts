export const toTelephone = (value?: string | null): string => {
	if (!value) return "-";

	if (value.startsWith("+")) {
		const cleaned = value.replace(/[^\d+]/g, "");
		const digits = cleaned.replace(/\D/g, "");

		if (digits.length > 11) {
			if (digits.length === 13) {
				const formatted = digits.replace(
					/(\d{2})(\d{2})(\d{5})(\d{4})/,
					"$1 $2 $3-$4",
				);
				return `+${formatted}`;
			}
			const formatted = digits.replace(
				/(\d{2})(\d{2})(\d+)(\d{4})$/,
				"$1 $2 $3-$4",
			);
			if (formatted !== digits) {
				return `+${formatted}`;
			}
			return `+${digits.replace(/(\d{2,3})(?=\d)/g, "$1 ")}`;
		}

		if (digits.length === 11) {
			const formatted = digits.replace(
				/(\d{2})(\d{2})(\d{5})(\d{4})/,
				"$1 $2 $3-$4",
			);
			return `+${formatted}`;
		}

		return `+${digits}`;
	}

	const digits = value.replace(/\D/g, "");

	if (digits.length === 10) {
		return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
	}

	if (digits.length === 11) {
		return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
	}

	return value;
};
