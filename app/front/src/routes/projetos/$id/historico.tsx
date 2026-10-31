import { ProjectHistoryPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

const SectionRoute = () => {
	const { id } = Route.useParams();

	return <ProjectHistoryPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/historico")({
	head: () => ({ meta: [{ title: pageTitle("Histórico") }] }),
	component: SectionRoute,
});
