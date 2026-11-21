import type { UserRole } from "@features/shared";

export const getProjectsPageTitle = (role: UserRole | undefined) =>
	role === "user" ? "Meus Projetos" : "Projetos";
