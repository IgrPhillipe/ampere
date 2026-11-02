import { apiResponseSchema } from "@features/shared";
import { findingStageSchema } from "@services/project-review";
import { z } from "zod";

export const dashboardPeriodSchema = z.enum([
	"LAST_30_DAYS",
	"LAST_90_DAYS",
	"CURRENT_YEAR",
]);

export type DashboardPeriod = z.infer<typeof dashboardPeriodSchema>;

/** A rejected project with open blocking findings, or a draft left idle. */
export const actionRequiredItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	protocol: z.string().nullable(),
	status: z.enum(["REJECTED", "DRAFT"]),
	blockingFindings: z.number().int().nonnegative(),
	idleDays: z.number().int().nonnegative().nullable(),
});

export type ActionRequiredItem = z.infer<typeof actionRequiredItemSchema>;

export const underReviewItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	protocol: z.string().nullable(),
	deadline: z.iso.date(),
	/** Negative once the deadline has passed. */
	daysRemaining: z.number().int(),
});

export type UnderReviewItem = z.infer<typeof underReviewItemSchema>;

export const designerIndicatorsSchema = z.object({
	submitted: z.number().int().nonnegative(),
	firstReviewApprovalPercent: z.number().min(0).max(100),
	averageDaysToApproval: z.number().nonnegative().nullable(),
	/** Total demand of the approved projects, in kVA. */
	approvedDemand: z.number().nonnegative(),
});

export type DesignerIndicators = z.infer<typeof designerIndicatorsSchema>;

export const findingRankingItemSchema = z.object({
	stage: findingStageSchema,
	standardItem: z.string().nullable(),
	total: z.number().int().nonnegative(),
});

export type FindingRankingItem = z.infer<typeof findingRankingItemSchema>;

export const designerDashboardSchema = z.object({
	hasSubmissions: z.boolean(),
	actionRequired: z.array(actionRequiredItemSchema),
	underReview: z.array(underReviewItemSchema),
	indicators: designerIndicatorsSchema,
	findingsRanking: z.array(findingRankingItemSchema),
});

export type DesignerDashboard = z.infer<typeof designerDashboardSchema>;

/** `GET /dashboard/designer?period=`: the period moves the indicators and the ranking, not the two lists. */
export const designerDashboardResponseSchema = apiResponseSchema(
	designerDashboardSchema,
);

export type DesignerDashboardResponse = z.infer<
	typeof designerDashboardResponseSchema
>;
