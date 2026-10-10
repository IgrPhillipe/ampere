import { ProjectDataPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const NewProjectRoute = () => <ProjectDataPage />;

export const Route = createFileRoute("/projetos/novo")({
	beforeLoad: requireRoles(["user"]),
	head: () => ({ meta: [{ title: pageTitle("Novo Projeto") }] }),
	component: NewProjectRoute,
});
