import { z } from "zod";

export const projectStatusSchema = z.enum([
	"DRAFT",
	"AWAITING_SUBMISSION",
	"UNDER_REVIEW",
	"REJECTED",
	"APPROVED",
]);

export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const projectSchema = z.object({
	id: z.string(),
	name: z.string(),
	address: z.string(),
	municipality: z.string(),
	protocol: z.string(),
	status: projectStatusSchema,
	// `offset: true` aceita `Z` e `±HH:mm`, e recusa timestamp sem fuso: sem o
	// offset o `fromNow()` resolve pelo relogio do navegador e sai deslocado.
	createdAt: z.iso.datetime({ offset: true }),
	updatedAt: z.iso.datetime({ offset: true }),
	pendingCount: z.number().int().nonnegative(),
});

export type Project = z.infer<typeof projectSchema>;

export const projectStatusCountsSchema = z.object({
	total: z.number().int().nonnegative(),
	draft: z.number().int().nonnegative(),
	awaitingSubmission: z.number().int().nonnegative(),
	underReview: z.number().int().nonnegative(),
	rejected: z.number().int().nonnegative(),
	approved: z.number().int().nonnegative(),
});

export type ProjectStatusCounts = z.infer<typeof projectStatusCountsSchema>;

const paginationSchema = z.object({
	total: z.number().int().nonnegative(),
	page: z.number().int().positive(),
	pageSize: z.number().int().positive(),
});

/** `GET /projects` — a página, sem os contadores. */
export const projectListResponseSchema = z.object({
	data: z.array(projectSchema),
	pagination: paginationSchema,
});

export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;

/** `GET /projects/status-counts` — contadores globais, sem paginação. */
export const projectStatusCountsResponseSchema = z.object({
	data: projectStatusCountsSchema,
});

export type ProjectStatusCountsResponse = z.infer<
	typeof projectStatusCountsResponseSchema
>;
