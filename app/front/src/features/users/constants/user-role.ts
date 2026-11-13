import type { UserRole } from "@features/shared";

export const userRoleLabels = {
	user: "Projetista",
	reviewer: "Analista",
	admin: "Gestor",
} as const satisfies Record<UserRole, string>;

/** Plural labels of the role quick filters. */
export const userRolePluralLabels = {
	user: "Projetistas",
	reviewer: "Analistas",
	admin: "Gestores",
} as const satisfies Record<UserRole, string>;
