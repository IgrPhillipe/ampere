import { emailSchema, textFieldSchema } from "@features/shared";
import { z } from "zod";

const passwordPolicy = z
	.string({ error: "A senha é obrigatória." })
	.min(8, {
		error: "A senha precisa de 8 caracteres, com letra e número.",
	})
	.regex(/^(?=.*[\p{L}])(?=.*\d).{8,72}$/u, {
		error: "A senha precisa de 8 caracteres, com letra e número.",
	});

export const profileSchema = z.object({
	name: textFieldSchema.max(120, {
		error: "O nome deve ter no máximo 120 caracteres.",
	}),
	email: emailSchema,
	company: z
		.string()
		.trim()
		.max(120, { error: "A empresa deve ter no máximo 120 caracteres." })
		.optional()
		.nullable(),
	phone: z
		.string({ error: "O telefone é obrigatório." })
		.trim()
		.min(1, { error: "O telefone é obrigatório." })
		.max(20, { error: "O telefone deve ter no máximo 20 caracteres." }),
	crea: z
		.string({ error: "O número do CREA é obrigatório." })
		.trim()
		.min(1, { error: "O número do CREA é obrigatório." })
		.regex(/^[0-9]{4,12}[A-Za-z]?(-[A-Za-z])?$/, {
			error: "Informe só o número do CREA, sem a UF.",
		}),
	creaState: z
		.string({ error: "A UF do CREA é obrigatória." })
		.trim()
		.min(1, { error: "A UF do CREA é obrigatória." })
		.regex(/^[A-Za-z]{2}$/, {
			error: "Informe a UF com duas letras.",
		}),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
	.object({
		currentPassword: textFieldSchema,
		newPassword: passwordPolicy,
		confirmNewPassword: z
			.string({ error: "A confirmação da nova senha é obrigatória." })
			.trim()
			.min(1, { error: "A confirmação da nova senha é obrigatória." }),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "As senhas não conferem.",
		path: ["confirmNewPassword"],
	});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
