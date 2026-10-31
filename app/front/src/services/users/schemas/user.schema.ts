import { apiResponseSchema, paginatedResponseSchema } from "@features/shared";
import { userRoleSchema } from "@services/auth";
import { z } from "zod";

/** A row of `GET /users`, the administrator's listing. */
export const managedUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	role: userRoleSchema,
	active: z.boolean(),
	mustChangePassword: z.boolean(),
	lastLoginAt: z.iso.datetime({ offset: true }).nullable(),
	createdAt: z.iso.datetime({ offset: true }),
});

export type ManagedUser = z.infer<typeof managedUserSchema>;

export const managedUserListResponseSchema = paginatedResponseSchema(
	z.array(managedUserSchema),
);

export type ManagedUserListResponse = z.infer<
	typeof managedUserListResponseSchema
>;

export const managedUserResponseSchema = apiResponseSchema(managedUserSchema);

/** The only response that carries the temporary password: the screen shows it once. */
export const temporaryAccessSchema = z.object({
	user: managedUserSchema,
	temporaryPassword: z.string(),
});

export type TemporaryAccess = z.infer<typeof temporaryAccessSchema>;

export const temporaryAccessResponseSchema = apiResponseSchema(
	temporaryAccessSchema,
);
