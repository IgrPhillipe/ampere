import type { z } from "zod";

import {
	confirmationSchema,
	designerProfileSchema,
	passwordSchema,
} from "./profile.schema";

export const registerSchema = designerProfileSchema
	.extend({ password: passwordSchema, confirmPassword: confirmationSchema })
	.refine((data) => data.password === data.confirmPassword, {
		error: "As senhas não conferem.",
		path: ["confirmPassword"],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;
