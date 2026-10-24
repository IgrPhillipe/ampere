import { SubmissionPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const SubmissionRoute = () => {
	const { id } = Route.useParams();

	return <SubmissionPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/envio")({
	beforeLoad: requireRoles(ROLE_ACCESS.projects),
	head: () => ({ meta: [{ title: pageTitle("Envio") }] }),
	component: SubmissionRoute,
});
