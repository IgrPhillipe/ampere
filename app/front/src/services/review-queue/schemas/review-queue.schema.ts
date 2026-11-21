import { apiResponseSchema, paginatedResponseSchema } from "@features/shared";
import { brazilianStateSchema } from "@services/locations";
import { z } from "zod";

/** `ALL` and the next three list the projects under review; the last two, the decided ones. */
export const reviewQueueFilterSchema = z.enum([
	"ALL",
	"DUE_SOON",
	"HIGH_DEMAND",
	"REANALYSIS",
	"APPROVED",
	"REJECTED",
]);

/** The views of the projects the analyst already decided. */
export const DECIDED_REVIEW_FILTERS: readonly ReviewQueueFilter[] = [
	"APPROVED",
	"REJECTED",
];

export type ReviewQueueFilter = z.infer<typeof reviewQueueFilterSchema>;

export const reviewQueueSortSchema = z.enum([
	"deadline",
	"submittedAt",
	"demand",
	"warnings",
]);

export type ReviewQueueSort = z.infer<typeof reviewQueueSortSchema>;

/** `reviewer` value for projects nobody picked up yet. */
export const UNASSIGNED_REVIEWER = "none";

export const reviewerRoleSchema = z.enum(["reviewer", "admin"]);

export type ReviewerRole = z.infer<typeof reviewerRoleSchema>;

export const reviewerSchema = z.object({
	id: z.string(),
	name: z.string(),
	// An unknown role must not drop the whole list; it reads as an analyst.
	role: reviewerRoleSchema.catch("reviewer"),
	// False for someone deactivated who still holds projects: filterable, not assignable.
	active: z.boolean(),
});

export type Reviewer = z.infer<typeof reviewerSchema>;

export const queueOwnerSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export type QueueOwner = z.infer<typeof queueOwnerSchema>;

export const deadlineStatusSchema = z.enum(["OVERDUE", "DUE_TODAY", "ON_TIME"]);

export type DeadlineStatus = z.infer<typeof deadlineStatusSchema>;

/** The statuses a submitted project goes through; `projects` imports this module, so no reuse. */
export const reviewQueueStatusSchema = z.enum([
	"UNDER_REVIEW",
	"APPROVED",
	"REJECTED",
	"EXPIRED",
]);

export type ReviewQueueStatus = z.infer<typeof reviewQueueStatusSchema>;

export const reviewQueueItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	protocol: z.string(),
	status: reviewQueueStatusSchema,
	/** The decision's date; null while the project is under review. */
	reviewedAt: z.iso.datetime({ offset: true }).nullable(),
	municipality: z.string(),
	state: brazilianStateSchema,
	submittedAt: z.iso.datetime({ offset: true }),
	// A decided project has no deadline left.
	deadline: z.iso.date().nullable(),
	deadlineStatus: deadlineStatusSchema.nullable(),
	daysRemaining: z.number().int(),
	warnings: z.number().int().nonnegative(),
	alerts: z.array(z.string()),
	ownerId: z.string().nullable(),
	ownerName: z.string().nullable(),
	consumerUnitsCount: z.number().int().nonnegative(),
	demandKva: z.number().nonnegative().nullable(),
	reanalysis: z.boolean(),
	reviewCycle: z.number().int().positive(),
	reviewerId: z.string().nullable(),
	reviewerName: z.string().nullable(),
});

export type ReviewQueueItem = z.infer<typeof reviewQueueItemSchema>;

export const reviewQueueIndicatorsSchema = z.object({
	total: z.number().int().nonnegative(),
	dueSoon: z.number().int().nonnegative(),
	highDemand: z.number().int().nonnegative(),
	reanalysis: z.number().int().nonnegative(),
	reviewedToday: z.number().int().nonnegative(),
	monthlyRejectionPercent: z.number().nonnegative(),
	approved: z.number().int().nonnegative(),
	rejected: z.number().int().nonnegative(),
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

export const reviewerListResponseSchema = apiResponseSchema(
	z.array(reviewerSchema),
);

export type ReviewerListResponse = z.infer<typeof reviewerListResponseSchema>;

/** `GET /review-queue/owners`: the designers with a project in the queue. */
export const queueOwnerListResponseSchema = paginatedResponseSchema(
	z.array(queueOwnerSchema),
);

export type QueueOwnerListResponse = z.infer<
	typeof queueOwnerListResponseSchema
>;
