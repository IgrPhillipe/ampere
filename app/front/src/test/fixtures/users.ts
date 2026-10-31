import type { ManagedUser } from "@services/users";

export const managedUserOf = (
	overrides: Partial<ManagedUser> = {},
): ManagedUser => ({
	id: "2",
	name: "Ana Projetista",
	email: "ana@ampere.com",
	role: "user",
	active: true,
	mustChangePassword: false,
	lastLoginAt: "2026-10-30T13:45:00-03:00",
	createdAt: "2026-10-01T09:00:00-03:00",
	...overrides,
});
