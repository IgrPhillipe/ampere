import { apiResponseSchema } from "@features/shared";
import { projectDetailResponseSchema } from "@services/projects";
import { z } from "zod";

export const documentTypeSchema = z.enum([
	"ART",
	"SINGLE_LINE_DIAGRAM",
	"SITE_PLAN",
]);

export type DocumentType = z.infer<typeof documentTypeSchema>;

export const projectDocumentSchema = z.object({
	id: z.string(),
	type: documentTypeSchema,
	typeLabel: z.string(),
	filename: z.string(),
	fileSize: z.number().int(),
	uploadedAt: z.iso.datetime({ offset: true }),
});

export type ProjectDocument = z.infer<typeof projectDocumentSchema>;

export const checklistItemSchema = z.object({
	key: z.union([z.literal("CALCULATION"), documentTypeSchema]),
	label: z.string(),
	completed: z.boolean(),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const submissionChecklistSchema = z.object({
	items: z.array(checklistItemSchema),
	documents: z.array(projectDocumentSchema),
	canSubmit: z.boolean(),
});

export type SubmissionChecklist = z.infer<typeof submissionChecklistSchema>;

/** `GET /projects/{id}/submission`. */
export const submissionChecklistResponseSchema = apiResponseSchema(
	submissionChecklistSchema,
);

/** `POST /projects/{id}/documents`. */
export const projectDocumentResponseSchema = apiResponseSchema(
	projectDocumentSchema,
);

/** `POST /projects/{id}/submit` answers with the project, now under review. */
export const submitProjectResponseSchema = projectDetailResponseSchema;
