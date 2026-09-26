import { NormativeTablesPage } from "@features/admin";
import { pageTitle } from "@lib/page-title";
import { requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/normas")({
	beforeLoad: requireRoles(["admin"]),
	head: () => ({ meta: [{ title: pageTitle("Normas e tabelas") }] }),
	component: NormativeTablesPage,
});
