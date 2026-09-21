import { NewProjectPage } from "@features/projects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/projetos/novo")({
	component: NewProjectPage,
});
