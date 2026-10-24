import { z } from "zod";

export const resubmissionSchema = z.object({
	changeSummary: z
		.string()
		.trim()
		.min(1, {
			error: "Informe o resumo das alterações para reenviar o projeto.",
		})
		.max(2000, {
			error: "O resumo das alterações deve ter no máximo 2000 caracteres.",
		}),
});

export type ResubmissionValues = z.infer<typeof resubmissionSchema>;
