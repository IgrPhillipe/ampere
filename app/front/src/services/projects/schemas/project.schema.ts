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
	updatedAt: z.iso.datetime({ local: true }),
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

export const projectListSchema = z.object({
	projects: z.array(projectSchema),
	statusCounts: projectStatusCountsSchema,
});

export type ProjectList = z.infer<typeof projectListSchema>;

export const projectListResponseSchema = z.object({
	data: projectListSchema,
	pagination: z.object({
		total: z.number().int().nonnegative(),
		page: z.number().int().positive(),
		pageSize: z.number().int().positive(),
	}),
});

export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;
