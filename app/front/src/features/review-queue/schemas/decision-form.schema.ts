import { z } from "zod";

export const decisionFormSchema = z.object({
	opinion: z
		.string()
		.trim()
		.min(1, { error: "O parecer é obrigatório." })
		.max(2000, { error: "O parecer deve ter no máximo 2000 caracteres." }),
});

export type DecisionFormValues = z.infer<typeof decisionFormSchema>;
