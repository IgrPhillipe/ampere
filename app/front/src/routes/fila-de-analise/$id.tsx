import { ProjectReviewPage } from "@features/review-queue";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const ProjectReviewRoute = () => {
	const { id } = Route.useParams();

	return <ProjectReviewPage projectId={id} />;
};

export const Route = createFileRoute("/fila-de-analise/$id")({
	beforeLoad: requireRoles(ROLE_ACCESS.reviewQueue),
	head: () => ({ meta: [{ title: pageTitle("Análise do Projeto") }] }),
	component: ProjectReviewRoute,
});
