import type { UserRole } from "@features/shared";

/** How the header names each role, as in the Figma top bar. */
export const ROLE_LABEL: Record<UserRole, string> = {
	user: "Projetista",
	reviewer: "Analista",
	admin: "Administrador",
};
