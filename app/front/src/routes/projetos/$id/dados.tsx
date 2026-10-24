import { ProjectDataPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const ProjectDataRoute = () => {
	const { id } = Route.useParams();

	return <ProjectDataPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/dados")({
	beforeLoad: requireRoles(ROLE_ACCESS.projects),
	head: () => ({ meta: [{ title: pageTitle("Dados da Edificação") }] }),
	component: ProjectDataRoute,
});
