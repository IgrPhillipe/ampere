import { DistributionPage } from "@features/reviewer-distribution";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/distribuicao")({
	beforeLoad: requireRoles(ROLE_ACCESS.distribution),
	head: () => ({ meta: [{ title: pageTitle("Distribuição") }] }),
	component: DistributionPage,
});
