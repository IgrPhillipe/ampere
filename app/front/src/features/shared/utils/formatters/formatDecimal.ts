/**
 * Numero com virgula decimal e casas fixas, como a norma e o memorial
 * escrevem: `6,50`, `431,40`.
 */
export const formatDecimal = (value: number, fractionDigits = 2) =>
	new Intl.NumberFormat("pt-BR", {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	}).format(value);

/** Contagem com dois digitos, como os indices da interface: `01`, `24`. */
export const padCount = (value: number) => String(value).padStart(2, "0");
