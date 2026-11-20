import { apiResponseSchema } from "@features/shared";
import { z } from "zod";

export const reviewerLoadSchema = z.object({
	id: z.string(),
	name: z.string(),
	active: z.boolean(),
	underReview: z.number().int().nonnegative(),
});

export type ReviewerLoad = z.infer<typeof reviewerLoadSchema>;

export const adminDashboardUsersSummarySchema = z.object({
	activeByRole: z.record(z.string(), z.number().int().nonnegative()),
	inactive: z.number().int().nonnegative(),
	mustChangePassword: z.number().int().nonnegative(),
	withoutAccess30Days: z.number().int().nonnegative(),
});

export type AdminDashboardUsersSummary = z.infer<
	typeof adminDashboardUsersSummarySchema
>;

export const adminDashboardProjectsSummarySchema = z.object({
	draft: z.number().int().nonnegative(),
	awaitingSubmission: z.number().int().nonnegative(),
	underReview: z.number().int().nonnegative(),
	rejected: z.number().int().nonnegative(),
});

export type AdminDashboardProjectsSummary = z.infer<
	typeof adminDashboardProjectsSummarySchema
>;

export const adminDashboardQueueSummarySchema = z.object({
	unassigned: z.number().int().nonnegative(),
	dueIn3Days: z.number().int().nonnegative(),
	overdue: z.number().int().nonnegative(),
	byReviewer: z.array(reviewerLoadSchema),
});

export type AdminDashboardQueueSummary = z.infer<
	typeof adminDashboardQueueSummarySchema
>;

export const adminDashboardSchema = z.object({
	users: adminDashboardUsersSummarySchema,
	projects: adminDashboardProjectsSummarySchema,
	queue: adminDashboardQueueSummarySchema,
});

export type AdminDashboard = z.infer<typeof adminDashboardSchema>;

export const adminDashboardResponseSchema =
	apiResponseSchema(adminDashboardSchema);

export type AdminDashboardResponse = z.infer<
	typeof adminDashboardResponseSchema
>;
