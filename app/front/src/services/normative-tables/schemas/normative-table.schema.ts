import { apiResponseSchema } from "@features/shared";
import { z } from "zod";

export const normativeStandardSchema = z.enum(["DIS-NOR-053", "DIS-NOR-030"]);

export type NormativeStandard = z.infer<typeof normativeStandardSchema>;

export const normativeTableStatusSchema = z.enum([
	"DRAFT",
	"PUBLISHED",
	"SUPERSEDED",
]);

export type NormativeTableStatus = z.infer<typeof normativeTableStatusSchema>;

export const normativeTableKeySchema = z.object({
	code: z.string(),
	label: z.string(),
});

export type NormativeTableKey = z.infer<typeof normativeTableKeySchema>;

export const normativeTableCodeSchema = z.object({
	code: z.string(),
	standard: normativeStandardSchema,
	identification: z.string(),
	title: z.string(),
	item: z.string(),
	page: z.string(),
	keys: z.array(normativeTableKeySchema),
	// Null means the table is looked up by key only, without ranges.
	argumentLabel: z.string().nullable(),
	valueLabels: z.array(z.string()).min(1).max(3),
});

export type NormativeTableCode = z.infer<typeof normativeTableCodeSchema>;

export const normativeTableRowSchema = z.object({
	key: z.string().nullish(),
	lowerBound: z.number().nullish(),
	upperBound: z.number().nullish(),
	value: z.number(),
	secondValue: z.number().nullish(),
	thirdValue: z.number().nullish(),
	label: z.string().nullish(),
});

export type NormativeTableRow = z.infer<typeof normativeTableRowSchema>;

export const normativeTableSchema = z.object({
	id: z.string(),
	standard: z.object({ name: z.string(), revision: z.string() }),
	code: z.string(),
	title: z.string(),
	identification: z.string(),
	item: z.string(),
	page: z.string(),
	status: normativeTableStatusSchema,
	rowCount: z.number().int().nonnegative(),
	registeredBy: z.string(),
	registeredAt: z.string(),
	verifiedBy: z.string().nullish(),
	verifiedAt: z.string().nullish(),
	rows: z.array(normativeTableRowSchema).optional(),
});

export type NormativeTable = z.infer<typeof normativeTableSchema>;

export const normativeTableCodeListResponseSchema = apiResponseSchema(
	z.array(normativeTableCodeSchema),
);

export type NormativeTableCodeListResponse = z.infer<
	typeof normativeTableCodeListResponseSchema
>;

export const normativeTableListResponseSchema = apiResponseSchema(
	z.array(normativeTableSchema),
);

export type NormativeTableListResponse = z.infer<
	typeof normativeTableListResponseSchema
>;

export const normativeTableResponseSchema =
	apiResponseSchema(normativeTableSchema);

export type NormativeTableResponse = z.infer<
	typeof normativeTableResponseSchema
>;
