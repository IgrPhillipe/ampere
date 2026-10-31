import type { UserRole } from "@features/shared";

export const userRoleLabels = {
	user: "Projetista",
	reviewer: "Analista",
	admin: "Administrador",
} as const satisfies Record<UserRole, string>;

export const userRoleBadgeVariants = {
	user: "tag",
	reviewer: "info",
	admin: "outline",
} as const satisfies Record<UserRole, string>;
