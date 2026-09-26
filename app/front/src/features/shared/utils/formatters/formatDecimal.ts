export const formatDecimal = (value: number, fractionDigits = 2) =>
	new Intl.NumberFormat("pt-BR", {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(value);

export const padCount = (value: number) => String(value).padStart(2, "0");
