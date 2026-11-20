import { apiResponseSchema } from "@features/shared";
import { brazilianStateSchema } from "@services/locations";
import { buildingCategorySchema } from "@services/projects";
import { z } from "zod";

import { findingRankingItemSchema } from "./dashboard.schema";

const count = z.number().int().nonnegative();

/** A project behind an indicator, enough to open it. */
export const reviewDashboardProjectSchema = z.object({
	id: z.string(),
	name: z.string(),
	protocol: z.string(),
});

export type ReviewDashboardProject = z.infer<
	typeof reviewDashboardProjectSchema
>;

/** Projects in scope by situation: decided in the period, or still under review. */
export const reviewDashboardTotalsSchema = z.object({
	received: count,
	approved: count,
	rejected: count,
	underReview: count,
});

export type ReviewDashboardTotals = z.infer<typeof reviewDashboardTotalsSchema>;

export const reviewWeekSchema = z.object({
	/** Monday of the week. */
	weekStart: z.iso.date(),
	received: count,
	decided: count,
});

export type ReviewWeek = z.infer<typeof reviewWeekSchema>;

export const monthlyRejectionSchema = z.object({
	/** `YYYY-MM`. */
	month: z.string().regex(/^\d{4}-\d{2}$/),
	/** `null` in a month without decisions. */
	rejectionPercent: z.number().min(0).max(100).nullable(),
});

export type MonthlyRejection = z.infer<typeof monthlyRejectionSchema>;

export const reviewDeadlinesSchema = z.object({
	met: count,
	overdue: count,
});

export type ReviewDeadlines = z.infer<typeof reviewDeadlinesSchema>;

/** Admin only: empty for the analyst, who sees only their own projects. */
export const reviewerWorkloadSchema = z.object({
	id: z.string(),
	name: z.string(),
	underReview: count,
});

export type ReviewerWorkload = z.infer<typeof reviewerWorkloadSchema>;

/** A ranking line carries its projects in scope, so the click lists them without another request. */
export const reviewFindingRankingItemSchema = findingRankingItemSchema.extend({
	projects: z.array(reviewDashboardProjectSchema),
});

export type ReviewFindingRankingItem = z.infer<
	typeof reviewFindingRankingItemSchema
>;

export const municipalityTotalSchema = z.object({
	municipality: z.string(),
	state: brazilianStateSchema,
	total: count,
});

export type MunicipalityTotal = z.infer<typeof municipalityTotalSchema>;

export const repeatedRejectionSchema = reviewDashboardProjectSchema.extend({
	/** Always above 1. */
	rejections: z.number().int().min(2),
});

export type RepeatedRejection = z.infer<typeof repeatedRejectionSchema>;

export const categoryAlertsSchema = z.object({
	category: buildingCategorySchema,
	/** Pre-validation alerts of the projects received in the period. */
	alerts: count,
	projects: count,
});

export type CategoryAlerts = z.infer<typeof categoryAlertsSchema>;

export const reviewDashboardSchema = z.object({
	totals: reviewDashboardTotalsSchema,
	/** `null` without a decision in the period. */
	averageReviewDays: z.number().nonnegative().nullable(),
	/** From the first submission to the approval; `null` without an approval. */
	averageCycleDays: z.number().nonnegative().nullable(),
	weekly: z.array(reviewWeekSchema),
	monthlyRejection: z.array(monthlyRejectionSchema),
	deadlines: reviewDeadlinesSchema,
	workload: z.array(reviewerWorkloadSchema),
	findingsRanking: z.array(reviewFindingRankingItemSchema),
	municipalities: z.array(municipalityTotalSchema),
	repeatedRejections: z.array(repeatedRejectionSchema),
	alertsByCategory: z.array(categoryAlertsSchema),
});

export type ReviewDashboard = z.infer<typeof reviewDashboardSchema>;

/** `GET /dashboard/review?period=`: the analyst's assigned projects, or the whole team for the admin. */
export const reviewDashboardResponseSchema = apiResponseSchema(
	reviewDashboardSchema,
);

export type ReviewDashboardResponse = z.infer<
	typeof reviewDashboardResponseSchema
>;
