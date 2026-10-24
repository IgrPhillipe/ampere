import { MemorialPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

const SectionRoute = () => {
	const { id } = Route.useParams();

	return <MemorialPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/memorial")({
	head: () => ({ meta: [{ title: pageTitle("Memorial") }] }),
	component: SectionRoute,
});
