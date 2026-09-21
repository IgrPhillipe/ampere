import type { UserRole } from "@features/shared";
import { z } from "zod";

export const userRoleSchema = z.enum([
	"user",
	"admin",
]) satisfies z.ZodType<UserRole>;

export const authUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.email(),
	role: userRoleSchema,
	avatarUrl: z.string().optional(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
	token: z.string(),
	user: authUserSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
