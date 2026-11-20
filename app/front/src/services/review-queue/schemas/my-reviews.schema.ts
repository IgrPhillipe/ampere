import { paginatedResponseSchema } from "@features/shared";
import { brazilianStateSchema } from "@services/locations";
import { z } from "zod";

/** The analyst's own decision on a submission. */
export const myReviewDecisionSchema = z.enum(["APPROVED", "REJECTED"]);

export type MyReviewDecision = z.infer<typeof myReviewDecisionSchema>;

export const myReviewFilterSchema = z.enum([
	"ALL",
	...myReviewDecisionSchema.options,
]);

export type MyReviewFilter = z.infer<typeof myReviewFilterSchema>;

/** One decision of the signed-in analyst: a project shows once per version decided. */
export const myReviewItemSchema = z.object({
	/** The project's id: the row opens its analysis in consultation. */
	id: z.string(),
	name: z.string(),
	protocol: z.string(),
	municipality: z.string(),
	state: brazilianStateSchema,
	ownerName: z.string().nullable(),
	decision: myReviewDecisionSchema,
	decidedAt: z.iso.datetime({ offset: true }),
	findings: z.number().int().nonnegative(),
	/** The submission decided, 1 for the first. */
	version: z.number().int().positive(),
	/** The project's latest submission: an older decision opens the history instead. */
	currentVersion: z.number().int().positive(),
	consumerUnitsCount: z.number().int().nonnegative(),
	demandKva: z.number().nonnegative().nullable(),
});

export type MyReviewItem = z.infer<typeof myReviewItemSchema>;

/** Counted with every filter but the decision, so each chip says what it would show. */
export const myReviewCountsSchema = z.object({
	all: z.number().int().nonnegative(),
	approved: z.number().int().nonnegative(),
	rejected: z.number().int().nonnegative(),
});

export type MyReviewCounts = z.infer<typeof myReviewCountsSchema>;

/** `GET /review-queue/mine`: the signed-in user's decisions, newest first; an analyst's only on projects still assigned to them. */
export const myReviewListResponseSchema = paginatedResponseSchema(
	z.array(myReviewItemSchema),
).extend({ counts: myReviewCountsSchema });

export type MyReviewListResponse = z.infer<typeof myReviewListResponseSchema>;
