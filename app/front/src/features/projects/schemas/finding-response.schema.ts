import { z } from "zod";

export const findingResponseSchema = z
	.object({
		status: z.enum(["FIXED", "CONTESTED"]),
		response: z
			.string()
			.trim()
			.max(2000, { error: "A resposta deve ter no máximo 2000 caracteres." }),
	})
	.superRefine(({ status, response }, context) => {
		if (status === "CONTESTED" && !response) {
			context.addIssue({
				code: "custom",
				path: ["response"],
				message: "A justificativa é obrigatória para contestar o apontamento.",
			});
		}
	});

export type FindingResponseValues = z.infer<typeof findingResponseSchema>;
