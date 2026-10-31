import { paginatedResponseSchema } from "@features/shared";
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
