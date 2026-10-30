import { userRoleSchema } from "@services/auth";
import { z } from "zod";

export const profileResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	role: userRoleSchema,
	crea: z.string().nullable(),
	creaState: z.string().nullable(),
	company: z.string().nullable(),
	phone: z.string().nullable(),
});

export type ProfileResponse = z.infer<typeof profileResponseSchema>;
