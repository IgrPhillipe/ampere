import { textFieldSchema } from "@features/shared";
import type {
	NormativeTable,
	NormativeTableCode,
	NormativeTablePayload,
	NormativeTableRow,
} from "@services/normative-tables";
import { z } from "zod";

const DECIMAL_PATTERN = /^-?\d+([.,]\d+)?$/;

const INVALID_NUMBER = "Informe um número.";

const optionalDecimalSchema = z
	.string()
	.trim()
	.refine((value) => value === "" || DECIMAL_PATTERN.test(value), {
		error: INVALID_NUMBER,
	});

const requiredDecimalSchema = z
	.string()
	.trim()
	.min(1, { error: "Obrigatório." })
	.refine((value) => DECIMAL_PATTERN.test(value), { error: INVALID_NUMBER });

// Accepts the Brazilian comma as the decimal separator.
const decimalSchema = z
	.string()
	.transform((value) => value.trim().replace(",", "."))
	.transform((value) => (value === "" ? null : Number(value)));

export const normativeTableRowFormSchema = z.object({
	key: z.string(),
	lowerBound: optionalDecimalSchema,
	upperBound: optionalDecimalSchema,
	value: requiredDecimalSchema,
	secondValue: optionalDecimalSchema,
	thirdValue: optionalDecimalSchema,
	label: z
		.string()
		.trim()
		.max(120, { error: "O rótulo deve ter no máximo 120 caracteres." }),
});

export type NormativeTableRowFormValues = z.infer<
	typeof normativeTableRowFormSchema
>;

export const normativeTableFormSchema = z.object({
	code: z.string().min(1, { error: "Selecione a tabela." }),
	identification: textFieldSchema,
	item: textFieldSchema,
	page: textFieldSchema,
	rows: z
		.array(normativeTableRowFormSchema)
		.min(1, { error: "Informe ao menos uma linha." }),
});

export type NormativeTableFormValues = z.infer<typeof normativeTableFormSchema>;

export const EMPTY_NORMATIVE_TABLE_ROW: NormativeTableRowFormValues = {
	key: "",
	lowerBound: "",
	upperBound: "",
	value: "",
	secondValue: "",
	thirdValue: "",
	label: "",
};

const toCell = (value: number | null | undefined) =>
	value == null ? "" : String(value).replace(".", ",");

const toRowFormValues = (
	row: NormativeTableRow,
): NormativeTableRowFormValues => ({
	key: row.key ?? "",
	lowerBound: toCell(row.lowerBound),
	upperBound: toCell(row.upperBound),
	value: toCell(row.value),
	secondValue: toCell(row.secondValue),
	thirdValue: toCell(row.thirdValue),
	label: row.label ?? "",
});

export const toNormativeTableFormValues = (
	table?: NormativeTable,
): NormativeTableFormValues => ({
	code: table?.code ?? "",
	identification: table?.identification ?? "",
	item: table?.item ?? "",
	page: table?.page ?? "",
	rows: table?.rows?.length
		? table.rows.map(toRowFormValues)
		: [EMPTY_NORMATIVE_TABLE_ROW],
});

/** Sends only the columns the code uses, so hidden cells never reach the API. */
export const toNormativeTablePayload = (
	values: NormativeTableFormValues,
	definition: NormativeTableCode,
): NormativeTablePayload => {
	const keyed = definition.keys.length > 0;
	const ranged = definition.argumentLabel !== null;
	const valueCount = definition.valueLabels.length;

	return {
		code: values.code,
		identification: values.identification,
		item: values.item,
		page: values.page,
		rows: values.rows.map((row) => ({
			key: keyed ? row.key || null : null,
			lowerBound: ranged ? decimalSchema.parse(row.lowerBound) : null,
			upperBound: ranged ? decimalSchema.parse(row.upperBound) : null,
			value: decimalSchema.parse(row.value) ?? 0,
			secondValue: valueCount > 1 ? decimalSchema.parse(row.secondValue) : null,
			thirdValue: valueCount > 2 ? decimalSchema.parse(row.thirdValue) : null,
			label: row.label || null,
		})),
	};
};
