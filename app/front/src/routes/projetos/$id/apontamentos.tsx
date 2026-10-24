import { ProjectFindingsPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const ProjectFindingsRoute = () => {
	const { id } = Route.useParams();

	return <ProjectFindingsPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/apontamentos")({
	beforeLoad: requireRoles(["user"]),
	head: () => ({ meta: [{ title: pageTitle("Apontamentos do Projeto") }] }),
	component: ProjectFindingsRoute,
});
