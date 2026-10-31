import { emailSchema, textFieldSchema } from "@features/shared";
import { userRoleSchema } from "@services/auth";
import { z } from "zod";

/** Same rules as `CreateUserRequest`; the edit keeps the e-mail read-only. */
export const userFormSchema = z.object({
	name: textFieldSchema.max(120, {
		error: "O nome deve ter no máximo 120 caracteres.",
	}),
	email: emailSchema.max(255, {
		error: "O e-mail deve ter no máximo 255 caracteres.",
	}),
	role: z.enum(userRoleSchema.options, { error: "O papel é obrigatório." }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
