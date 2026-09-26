import { ConsumerUnitsPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

const ConsumerUnitsRoute = () => {
	const { id } = Route.useParams();

	return <ConsumerUnitsPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/unidades")({
	head: () => ({ meta: [{ title: pageTitle("Unidades consumidoras") }] }),
	component: ConsumerUnitsRoute,
});
