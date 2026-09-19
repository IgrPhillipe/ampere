export const cnpjRegexp = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

export const isValidCNPJ = (value: string): boolean => {
	const cnpj = value.replace(/[^\d]+/g, "");

	if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj) || !cnpjRegexp.test(value)) {
		return false;
	}

	let length = cnpj.length - 2;
	let numbers = cnpj.substring(0, length);
	const digits = cnpj.substring(length);
	let sum = 0;
	let pos = length - 7;

	for (let i = length; i >= 1; i--) {
		sum += parseInt(numbers.charAt(length - i), 10) * pos--;
		if (pos < 2) {
			pos = 9;
		}
	}

	let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
	if (result !== parseInt(digits.charAt(0), 10)) {
		return false;
	}

	length = length + 1;
	numbers = cnpj.substring(0, length);
	sum = 0;
	pos = length - 7;

	for (let i = length; i >= 1; i--) {
		sum += parseInt(numbers.charAt(length - i), 10) * pos--;
		if (pos < 2) {
			pos = 9;
		}
	}

	result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
	return result === parseInt(digits.charAt(1), 10);
};
