import { apiResponseSchema } from "@features/shared";
import { userRoleSchema } from "@services/auth";
import { z } from "zod";

export const projectEventTypeSchema = z.enum([
	"CREATED",
	"SUBMITTED",
	"PRE_VALIDATED",
	"ASSIGNED",
	"REJECTED",
	"APPROVED",
	"FINDING_ANSWERED",
	"RESUBMITTED",
]);

export type ProjectEventType = z.infer<typeof projectEventTypeSchema>;

export const projectEventSchema = z.object({
	id: z.string(),
	type: projectEventTypeSchema,
	/** The project's review cycle when the event happened; `0` before the first submission. */
	version: z.number().int().nonnegative(),
	description: z.string(),
	detail: z.string().nullable(),
	/** Both are null on the events the system records. */
	authorName: z.string().nullable(),
	authorRole: userRoleSchema.nullable(),
	occurredAt: z.iso.datetime({ offset: true }),
});

export type ProjectEvent = z.infer<typeof projectEventSchema>;

export const projectReworkSchema = z.object({
	/** Calendar days from the first submission to the approval, or to today; null before the first submission. */
	cycleDays: z.number().int().nonnegative().nullable(),
	submittedVersions: z.number().int().nonnegative(),
	reviewCycles: z.number().int().nonnegative(),
	resolvedFindings: z.number().int().nonnegative(),
	openFindings: z.number().int().nonnegative(),
	redoneCalculationSteps: z.number().int().nonnegative(),
});

export type ProjectRework = z.infer<typeof projectReworkSchema>;

/** `GET /projects/{id}/events`. */
export const projectEventListResponseSchema = apiResponseSchema(
	z.array(projectEventSchema),
);

/** `GET /projects/{id}/rework`. */
export const projectReworkResponseSchema =
	apiResponseSchema(projectReworkSchema);
