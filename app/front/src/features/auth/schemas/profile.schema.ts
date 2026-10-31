import { emailSchema, textFieldSchema } from "@features/shared";
import { z } from "zod";

const PASSWORD_POLICY_ERROR =
	"A senha deve ter ao menos 8 caracteres, com letra e número.";

/** Same policy as the API: 8 to 72 characters, with a letter and a digit. */
export const passwordSchema = z
	.string({ error: "A senha é obrigatória." })
	.regex(/^(?=.*\p{L})(?=.*\d).{8,72}$/u, { error: PASSWORD_POLICY_ERROR });

export const confirmationSchema = z
	.string({ error: "A confirmação da senha é obrigatória." })
	.min(1, { error: "A confirmação da senha é obrigatória." });

export const profileSchema = z.object({
	name: textFieldSchema.max(120, {
		error: "O nome deve ter no máximo 120 caracteres.",
	}),
	email: emailSchema,
	company: z
		.string()
		.trim()
		.max(120, { error: "A empresa deve ter no máximo 120 caracteres." })
		.optional(),
	phone: z
		.string({ error: "O telefone é obrigatório." })
		.trim()
		.min(1, { error: "O telefone é obrigatório." })
		.max(20, { error: "O telefone deve ter no máximo 20 caracteres." }),
	// Analysts and administrators have no CREA: kept as loaded and not shown.
	crea: z.string(),
	creaState: z.string(),
});

/** The designer's CREA identifies the technical responsible, so it is required. */
export const designerProfileSchema = profileSchema.extend({
	crea: z
		.string({ error: "O número do CREA é obrigatório." })
		.trim()
		.min(1, { error: "O número do CREA é obrigatório." })
		.regex(/^[0-9]{4,12}[A-Za-z]?$/, {
			error: "Informe só o número do CREA, sem a UF e sem hífen.",
		}),
	creaState: z
		.string({ error: "A UF do CREA é obrigatória." })
		.trim()
		.min(1, { error: "A UF do CREA é obrigatória." })
		.regex(/^[A-Za-z]{2}$/, { error: "Informe a UF com duas letras." })
		.toUpperCase(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
	.object({
		currentPassword: textFieldSchema,
		newPassword: passwordSchema,
		confirmNewPassword: confirmationSchema,
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		error: "As senhas não conferem.",
		path: ["confirmNewPassword"],
	});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
