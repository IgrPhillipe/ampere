import { SubmissionConfirmationPage } from "@features/projects/pages/SubmissionConfirmationPage";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const SubmissionRoute = () => {
	const { id } = Route.useParams();

	return <SubmissionConfirmationPage projectId={id} />;
};

// Outside the project workspace: the receipt replaces the header and the sections.
export const Route = createFileRoute("/projetos/$id_/envio")({
	beforeLoad: requireRoles(ROLE_ACCESS.projectWorkspace),
	head: () => ({ meta: [{ title: pageTitle("Envio Concluído") }] }),
	component: SubmissionRoute,
});
