import { ReviewDashboardPage } from "@features/dashboard";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/indicadores")({
	beforeLoad: requireRoles(ROLE_ACCESS.reviewIndicators),
	head: () => ({ meta: [{ title: pageTitle("Indicadores") }] }),
	component: ReviewDashboardPage,
});
