import { emailSchema, textFieldSchema } from "@features/shared";
import { z } from "zod";

export const loginSchema = z.object({
	email: emailSchema,
	password: textFieldSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
