import { ProjectDetailPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const ProjectDetailRoute = () => {
	const { id } = Route.useParams();

	return <ProjectDetailPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/")({
	beforeLoad: requireRoles(ROLE_ACCESS.projects),
	head: () => ({ meta: [{ title: pageTitle("Detalhe do Projeto") }] }),
	component: ProjectDetailRoute,
});
