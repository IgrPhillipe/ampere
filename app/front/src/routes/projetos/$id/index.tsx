import { ProjectDetailPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const ProjectDetailRoute = () => {
	const { id } = Route.useParams();

	return <ProjectDetailPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/")({
	beforeLoad: requireRoles(["user"]),
	head: () => ({ meta: [{ title: pageTitle("Detalhe do Projeto") }] }),
	component: ProjectDetailRoute,
});
