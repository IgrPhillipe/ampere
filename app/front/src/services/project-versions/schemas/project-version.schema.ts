import { apiResponseSchema } from "@features/shared";
import { z } from "zod";

export const versionDocumentSchema = z.object({
	type: z.string(),
	typeLabel: z.string(),
	filename: z.string(),
	fileSize: z.number().int().nonnegative().nullable(),
});

/** One submission as it was sent: frozen, with the memorial issued then. */
export const projectVersionSchema = z.object({
	number: z.number().int().positive(),
	submittedAt: z.iso.datetime({ offset: true }),
	authorName: z.string().nullable(),
	changeSummary: z.string().nullable(),
	demandKva: z.number(),
	documents: z.array(versionDocumentSchema),
	memorialSha256: z.string().nullable(),
	/** Printed in the memorial footer, such as `7F3A-91C2-04BD-2E77`. */
	verificationCode: z.string().nullable(),
});

export type ProjectVersion = z.infer<typeof projectVersionSchema>;

export const projectVersionListResponseSchema = apiResponseSchema(
	z.array(projectVersionSchema),
);

export const fieldChangeSchema = z.object({
	field: z.string(),
	label: z.string(),
	from: z.string().nullable(),
	to: z.string().nullable(),
	/** The value as people read it; the raw one may be a code. */
	fromLabel: z.string().nullable(),
	toLabel: z.string().nullable(),
});

export type FieldChange = z.infer<typeof fieldChangeSchema>;

export const groupChangeSchema = z.object({
	id: z.string(),
	name: z.string(),
	fields: z.array(fieldChangeSchema),
});

export type GroupChange = z.infer<typeof groupChangeSchema>;

export const versionDemandSchema = z.object({
	number: z.number().int().positive(),
	submittedAt: z.iso.datetime({ offset: true }),
	demandKva: z.number(),
});

export const versionComparisonSchema = z.object({
	from: versionDemandSchema,
	to: versionDemandSchema,
	demandDifferenceKva: z.number(),
	included: z.array(groupChangeSchema),
	removed: z.array(groupChangeSchema),
	changed: z.array(groupChangeSchema),
	/** Changes to the building data, outside the groups. */
	building: z.array(fieldChangeSchema),
});

export type VersionComparison = z.infer<typeof versionComparisonSchema>;

export const versionComparisonResponseSchema = apiResponseSchema(
	versionComparisonSchema,
);

/** `verified: false` carries no data: the file or code matches no version. */
export const memorialVerificationSchema = z.object({
	verified: z.boolean(),
	protocol: z.string().nullable(),
	version: z.number().int().positive().nullable(),
	submittedAt: z.iso.datetime({ offset: true }).nullable(),
	/** Only on the memorial of an approval with reservations. */
	approvedAt: z.iso.datetime({ offset: true }).nullable(),
});

export type MemorialVerification = z.infer<typeof memorialVerificationSchema>;

export const memorialVerificationResponseSchema = apiResponseSchema(
	memorialVerificationSchema,
);
