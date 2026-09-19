export const cpfRegexp = /^(?!.*(\d)\1{10})\d{3}\.\d{3}\.\d{3}-\d{2}$/;

export const isValidCPF = (value: string): boolean => {
	const cpf = value.replace(/[^\d]/g, "");

	if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf) || !cpfRegexp.test(value)) {
		return false;
	}

	let sum = 0;
	let remainder;

	for (let i = 1; i <= 9; i++) {
		sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
	}

	remainder = (sum * 10) % 11;
	if (remainder === 10 || remainder === 11) remainder = 0;
	if (remainder !== parseInt(cpf.substring(9, 10), 10)) return false;

	sum = 0;
	for (let i = 1; i <= 10; i++) {
		sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
	}

	remainder = (sum * 10) % 11;
	if (remainder === 10 || remainder === 11) remainder = 0;
	return remainder === parseInt(cpf.substring(10, 11), 10);
};
