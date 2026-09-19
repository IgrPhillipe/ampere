import { ProjectsPage } from "@features/projects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: ProjectsPage,
});
