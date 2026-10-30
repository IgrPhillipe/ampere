import type { z } from "zod";

import {
	confirmationSchema,
	passwordSchema,
	profileSchema,
} from "./profile.schema";

export const registerSchema = profileSchema
	.extend({ password: passwordSchema, confirmPassword: confirmationSchema })
	.refine((data) => data.password === data.confirmPassword, {
		error: "As senhas não conferem.",
		path: ["confirmPassword"],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;
