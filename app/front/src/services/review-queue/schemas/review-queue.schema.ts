import { apiResponseSchema, paginatedResponseSchema } from "@features/shared";
import { z } from "zod";

export const reviewQueueFilterSchema = z.enum([
	"ALL",
	"DUE_SOON",
	"HIGH_DEMAND",
	"REANALYSIS",
]);

export type ReviewQueueFilter = z.infer<typeof reviewQueueFilterSchema>;

export const deadlineStatusSchema = z.enum(["OVERDUE", "DUE_TODAY", "ON_TIME"]);

export type DeadlineStatus = z.infer<typeof deadlineStatusSchema>;

export const reviewQueueItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	protocol: z.string(),
	municipality: z.string(),
	submittedAt: z.iso.datetime({ offset: true }),
	deadline: z.iso.date(),
	deadlineStatus: deadlineStatusSchema,
	daysRemaining: z.number().int(),
	warnings: z.number().int().nonnegative(),
	alerts: z.array(z.string()),
	ownerName: z.string().nullable(),
	consumerUnitsCount: z.number().int().nonnegative(),
	demandKva: z.number().nonnegative().nullable(),
	reanalysis: z.boolean(),
	reviewCycle: z.number().int().positive(),
});

export type ReviewQueueItem = z.infer<typeof reviewQueueItemSchema>;

export const reviewQueueIndicatorsSchema = z.object({
	total: z.number().int().nonnegative(),
	dueSoon: z.number().int().nonnegative(),
	highDemand: z.number().int().nonnegative(),
	reanalysis: z.number().int().nonnegative(),
	reviewedToday: z.number().int().nonnegative(),
	monthlyRejectionPercent: z.number().nonnegative(),
});

export type ReviewQueueIndicators = z.infer<typeof reviewQueueIndicatorsSchema>;

export const reviewQueueListResponseSchema = paginatedResponseSchema(
	z.array(reviewQueueItemSchema),
);

export type ReviewQueueListResponse = z.infer<
	typeof reviewQueueListResponseSchema
>;

export const reviewQueueIndicatorsResponseSchema = apiResponseSchema(
	reviewQueueIndicatorsSchema,
);

export type ReviewQueueIndicatorsResponse = z.infer<
	typeof reviewQueueIndicatorsResponseSchema
>;
