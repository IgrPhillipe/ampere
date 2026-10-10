import { ConsumerUnitsPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const ConsumerUnitsRoute = () => {
	const { id } = Route.useParams();

	return <ConsumerUnitsPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/unidades")({
	beforeLoad: requireRoles(["user"]),
	head: () => ({ meta: [{ title: pageTitle("Unidades Consumidoras") }] }),
	component: ConsumerUnitsRoute,
});
