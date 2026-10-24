import { ProjectOverviewPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

const SectionRoute = () => {
	const { id } = Route.useParams();

	return <ProjectOverviewPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/")({
	head: () => ({ meta: [{ title: pageTitle("Visão Geral do Projeto") }] }),
	component: SectionRoute,
});
