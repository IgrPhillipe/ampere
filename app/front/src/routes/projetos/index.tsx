import { ProjectsPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos/")({
	beforeLoad: requireRoles(["user"]),
	head: () => ({ meta: [{ title: pageTitle("Meus Projetos") }] }),
	component: ProjectsPage,
});
