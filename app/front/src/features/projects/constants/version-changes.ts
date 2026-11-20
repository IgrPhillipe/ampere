import { formatDecimal, padCount } from "@features/shared";
import type { FieldChange } from "@services/project-versions";

export const formatVersion = (number: number) => `v${padCount(number)}`;

/** "+2,4", "−1,0" or "0,0". */
export const formatKvaDelta = (delta: number) => {
	if (delta === 0) return formatDecimal(0, 1);

	return `${delta > 0 ? "+" : "−"}${formatDecimal(Math.abs(delta), 1)}`;
};

const NUMBER = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

/** The value as people read it, falling back to the raw one. */
export const fieldValue = (
	change: FieldChange,
	side: "from" | "to",
): string => {
	const label = side === "from" ? change.fromLabel : change.toLabel;
	const raw = side === "from" ? change.from : change.to;

	const value = label ?? raw;
	if (value === null) return "Não informado";

	// Numbers come in the API's notation, as in "3.0".
	return /^-?\d+(\.\d+)?$/.test(value) ? NUMBER.format(Number(value)) : value;
};
