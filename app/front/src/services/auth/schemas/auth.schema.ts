import type { UserRole } from "@features/shared";
import { z } from "zod";

/**
 * `satisfies` amarra o schema a uniao `UserRole`: se um papel for adicionado
 * la e esquecido aqui, o type-check quebra. O import e `type`, entao some no
 * build e nao cria ciclo com `@lib/http`.
 */
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
