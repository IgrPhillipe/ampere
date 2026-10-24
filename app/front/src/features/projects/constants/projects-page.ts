import type { UserRole } from "@features/shared";

/** The admin lists every designer's projects, so the page is not "theirs". */
export const getProjectsPageTitle = (role: UserRole | undefined) =>
	role === "admin" ? "Projetos" : "Meus Projetos";
