import { ProjectDataPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

const NewProjectRoute = () => <ProjectDataPage />;

export const Route = createFileRoute("/projetos/novo")({
	head: () => ({ meta: [{ title: pageTitle("Novo Projeto") }] }),
	component: NewProjectRoute,
});
