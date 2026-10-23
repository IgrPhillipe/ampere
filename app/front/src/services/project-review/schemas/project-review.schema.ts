import { apiResponseSchema } from "@features/shared";
import { projectStatusSchema } from "@services/projects/schemas/project.schema";
import { documentTypeSchema } from "@services/submission/schemas/submission.schema";
import { z } from "zod";

export const findingSeveritySchema = z.enum(["BLOCKING", "ADJUSTMENT"]);

export type FindingSeverity = z.infer<typeof findingSeveritySchema>;

export const findingStageSchema = z.enum([
	"PROJECT_DATA",
	"CONSUMER_UNITS",
	"CALCULATION",
	"DOCUMENTS",
]);

export type FindingStage = z.infer<typeof findingStageSchema>;

export const findingStatusSchema = z.enum([
	"DRAFT",
	"OPEN",
	"FIXED",
	"CONTESTED",
	"RESOLVED",
]);

export type FindingStatus = z.infer<typeof findingStatusSchema>;

export const findingResolutionSchema = z.enum(["ACCEPT", "REOPEN"]);

export type FindingResolution = z.infer<typeof findingResolutionSchema>;

export const reviewDecisionSchema = z.enum(["APPROVE", "REJECT"]);

export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

export const findingSchema = z.object({
	id: z.string(),
	projectId: z.string(),
	severity: findingSeveritySchema,
	stage: findingStageSchema,
	consumerUnitGroupId: z.string().nullable(),
	calculationStepCode: z.string().nullable(),
	documentType: documentTypeSchema.nullable(),
	description: z.string(),
	standardItem: z.string().nullable(),
	authorId: z.string().nullable(),
	authorName: z.string().nullable(),
	createdAt: z.iso.datetime({ offset: true }),
	version: z.number().int().positive(),
	status: findingStatusSchema,
	response: z.string().nullable(),
	respondedAt: z.iso.datetime({ offset: true }).nullable(),
});

export type Finding = z.infer<typeof findingSchema>;

export const findingListResponseSchema = apiResponseSchema(
	z.array(findingSchema),
);

export const findingResponseSchema = apiResponseSchema(findingSchema);

export const reviewAssignmentSchema = z.object({
	projectId: z.string(),
	reviewerId: z.string(),
	reviewerName: z.string(),
	reviewerEmail: z.string(),
});

export type ReviewAssignment = z.infer<typeof reviewAssignmentSchema>;

export const reviewAssignmentResponseSchema = apiResponseSchema(
	reviewAssignmentSchema,
);

export const reviewDecisionResultSchema = z.object({
	projectId: z.string(),
	status: projectStatusSchema,
	opinion: z.string().nullable(),
	reviewedAt: z.iso.datetime({ offset: true }),
});

export type ReviewDecisionResult = z.infer<typeof reviewDecisionResultSchema>;

export const reviewDecisionResponseSchema = apiResponseSchema(
	reviewDecisionResultSchema,
);
