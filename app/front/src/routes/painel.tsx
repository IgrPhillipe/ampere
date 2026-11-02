import { DesignerDashboardPage } from "@features/dashboard";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/painel")({
	beforeLoad: requireRoles(ROLE_ACCESS.dashboard),
	head: () => ({ meta: [{ title: pageTitle("Painel") }] }),
	component: DesignerDashboardPage,
});
