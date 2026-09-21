import { ProjectsPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	head: () => ({ meta: [{ title: pageTitle("Meus projetos") }] }),
	component: ProjectsPage,
});
