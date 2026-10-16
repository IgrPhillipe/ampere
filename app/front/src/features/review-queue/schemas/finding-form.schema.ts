import {
	findingSeveritySchema,
	findingStageSchema,
} from "@services/project-review";
import { z } from "zod";

export const findingFormSchema = z.object({
	severity: z.enum(findingSeveritySchema.options, {
		error: "A gravidade é obrigatória.",
	}),

	stage: z.enum(findingStageSchema.options, {
		error: "A etapa é obrigatória.",
	}),

	reference: z.string(),

	description: z
		.string()
		.trim()
		.min(1, { error: "A descrição é obrigatória." })
		.max(2000, { error: "A descrição deve ter no máximo 2000 caracteres." }),

	standardItem: z.string().trim().max(255, {
		error: "O item da norma deve ter no máximo 255 caracteres.",
	}),
});

export type FindingFormValues = z.infer<typeof findingFormSchema>;
