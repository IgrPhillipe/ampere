export const brlRegexp = /R\$\s?\d{1,3}(\.\d{3})*,\d{2}/;

export const isValidBRL = (value: string): boolean =>
	new RegExp(brlRegexp).test(value.trim());
