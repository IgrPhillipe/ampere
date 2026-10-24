import type { UserRole } from "@features/shared";

export const getProjectsPageTitle = (role: UserRole | undefined) =>
	role === "admin" ? "Projetos" : "Meus Projetos";
