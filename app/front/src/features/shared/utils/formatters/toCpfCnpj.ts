export const toCpfCnpj = (value?: string | null): string => {
	if (!value) return "-";

	const digits = value.replace(/\D/g, "");

	if (digits.length === 11) {
		// CPF: XXX.XXX.XXX-XX
		return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}

	if (digits.length === 14) {
		// CNPJ: XX.XXX.XXX/XXXX-XX
		return digits.replace(
			/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
			"$1.$2.$3/$4-$5",
		);
	}

	return value;
};
