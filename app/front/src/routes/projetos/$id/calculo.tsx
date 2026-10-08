import { CalculationPage } from "@features/projects";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

const CalculationRoute = () => {
	const { id } = Route.useParams();

	return <CalculationPage projectId={id} />;
};

export const Route = createFileRoute("/projetos/$id/calculo")({
	beforeLoad: requireRoles(["user"]),
	head: () => ({ meta: [{ title: pageTitle("Cálculo de Demanda") }] }),
	component: CalculationRoute,
});
