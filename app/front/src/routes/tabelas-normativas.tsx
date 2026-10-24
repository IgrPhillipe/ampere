import { NormativeTablesPage } from "@features/normative-tables";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tabelas-normativas")({
	beforeLoad: requireRoles(ROLE_ACCESS.normativeTables),
	head: () => ({ meta: [{ title: pageTitle("Tabelas Normativas") }] }),
	component: NormativeTablesPage,
});
