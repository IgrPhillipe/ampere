import { z } from "zod";

export const profileResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
	role: z.enum(["USER", "REVIEWER", "ADMIN", "user", "reviewer", "admin"]),
	crea: z.string().nullable().optional(),
	creaState: z.string().nullable().optional(),
	company: z.string().nullable().optional(),
	phone: z.string().nullable().optional(),
});

export type ProfileResponse = z.infer<typeof profileResponseSchema>;
