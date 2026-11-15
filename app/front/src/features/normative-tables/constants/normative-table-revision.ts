import { padCount } from "@features/shared";
import type {
	NormativeTableCode,
	NormativeTableRow,
} from "@services/normative-tables";

const numberFormat = new Intl.NumberFormat("pt-BR", {
	maximumFractionDigits: 4,
});

export const formatNormativeNumber = (value: number) =>
	numberFormat.format(value);

/** The revisions count from 1, in the order they took effect. */
export const formatRevision = (number: number) => `Revisão ${padCount(number)}`;

/** The band as the printed table says it, like the back end's "25 a 50" or "acima de 100". */
const formatBand = ({ lowerBound, upperBound, label }: NormativeTableRow) => {
	if (label) return label;
	if (upperBound == null)
		return lowerBound == null
			? ""
			: `acima de ${formatNormativeNumber(lowerBound)}`;
	if (lowerBound == null) return `até ${formatNormativeNumber(upperBound)}`;
	if (lowerBound === upperBound) return formatNormativeNumber(upperBound);

	return `${formatNormativeNumber(lowerBound)} a ${formatNormativeNumber(upperBound)}`;
};

/** What the row stands for: its key, its band, or both. */
export const formatRowEntry = (
	row: NormativeTableRow,
	definition?: NormativeTableCode,
) => {
	const key = row.key
		? (definition?.keys.find(({ code }) => code === row.key)?.label ?? row.key)
		: "";
	const band = formatBand(row);

	return [key, band].filter(Boolean).join(", ") || "Linha única";
};

export interface RowValue {
	label: string;
	value: string;
}

export const rowValues = (
	row: NormativeTableRow,
	definition?: NormativeTableCode,
): RowValue[] =>
	[row.value, row.secondValue, row.thirdValue].flatMap((value, index) =>
		value == null
			? []
			: [
					{
						label: definition?.valueLabels[index] ?? `Valor ${index + 1}`,
						value: formatNormativeNumber(value),
					},
				],
	);
