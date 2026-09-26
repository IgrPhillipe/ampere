import { ConsumerUnitsPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

// Declarado antes do `Route` e sem export: o code splitting automatico do
// TanStack Router separa o componente da rota.
const ConsumerUnitsRoute = () => {
	const { id } = Route.useParams();

	return <ConsumerUnitsPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/unidades")({
	head: () => ({ meta: [{ title: pageTitle("Unidades consumidoras") }] }),
	component: ConsumerUnitsRoute,
});
