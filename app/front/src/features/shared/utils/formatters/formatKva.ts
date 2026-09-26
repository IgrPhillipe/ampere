import { formatDecimal } from "./formatDecimal";

export const formatKva = (value: number, fractionDigits = 2) =>
	`${formatDecimal(value, fractionDigits)} kVA`;
