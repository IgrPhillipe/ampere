import { ProjectFindingsPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const ProjectFindingsRoute = () => {
	const { id } = Route.useParams();

	return <ProjectFindingsPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/apontamentos")({
	beforeLoad: requireRoles(ROLE_ACCESS.projects),
	head: () => ({ meta: [{ title: pageTitle("Apontamentos do Projeto") }] }),
	component: ProjectFindingsRoute,
});
