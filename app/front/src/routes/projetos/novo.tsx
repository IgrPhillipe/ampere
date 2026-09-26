import { NewProjectPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos/novo")({
	head: () => ({ meta: [{ title: pageTitle("Novo Projeto") }] }),
	component: NewProjectPage,
});
