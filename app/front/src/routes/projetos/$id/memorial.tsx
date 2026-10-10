import { MemorialPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const MemorialRoute = () => {
	const { id } = Route.useParams();

	return <MemorialPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/memorial")({
	beforeLoad: requireRoles(["user"]),
	head: () => ({ meta: [{ title: pageTitle("Memorial") }] }),
	component: MemorialRoute,
});
