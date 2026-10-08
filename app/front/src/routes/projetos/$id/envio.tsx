import { SubmissionPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const SubmissionRoute = () => {
	const { id } = Route.useParams();

	return <SubmissionPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/envio")({
	beforeLoad: requireRoles(["user"]),
	head: () => ({ meta: [{ title: pageTitle("Envio") }] }),
	component: SubmissionRoute,
});
