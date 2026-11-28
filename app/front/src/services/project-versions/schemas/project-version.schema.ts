import { apiResponseSchema } from "@features/shared";
import { documentTypeSchema } from "@services/submission";
import { z } from "zod";

export const versionDocumentSchema = z.object({
	type: documentTypeSchema,
	typeLabel: z.string(),
	filename: z.string(),
	fileSize: z.number().int().nonnegative().nullable(),
});

/** The memorial of an approval with reservations: another PDF, with a code of its own. */
export const approvalMemorialSchema = z.object({
	memorialSha256: z.string(),
	verificationCode: z.string(),
	issuedAt: z.iso.datetime({ offset: true }),
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
	approvalMemorial: approvalMemorialSchema.nullable(),
});

export type ProjectVersion = z.infer<typeof projectVersionSchema>;

export const projectVersionListResponseSchema = apiResponseSchema(
	z.array(projectVersionSchema),
);

export const issuedDocumentTypeSchema = z.enum([
	"SUBMISSION_MEMORIAL",
	"APPROVAL_MEMORIAL",
	"CALCULATION_SPREADSHEET",
]);

export type IssuedDocumentType = z.infer<typeof issuedDocumentTypeSchema>;

/** Of an uploaded PDF only: `null` when checking a code or a spreadsheet. */
export const signatureStatusSchema = z.enum([
	"VALID",
	"INVALID",
	"UNTRUSTED",
	"ABSENT",
]);

export type SignatureStatus = z.infer<typeof signatureStatusSchema>;

/** `verified: false` carries no data besides the signature: nothing issued matches. */
export const memorialVerificationSchema = z.object({
	verified: z.boolean(),
	documentType: issuedDocumentTypeSchema.nullable(),
	protocol: z.string().nullable(),
	/** `null` on the spreadsheet of a calculation not yet submitted. */
	version: z.number().int().positive().nullable(),
	submittedAt: z.iso.datetime({ offset: true }).nullable(),
	/** Only on the memorial of an approval with reservations. */
	approvedAt: z.iso.datetime({ offset: true }).nullable(),
	issuedAt: z.iso.datetime({ offset: true }).nullable(),
	signature: signatureStatusSchema.nullable(),
});

export type MemorialVerification = z.infer<typeof memorialVerificationSchema>;

export const memorialVerificationResponseSchema = apiResponseSchema(
	memorialVerificationSchema,
);
