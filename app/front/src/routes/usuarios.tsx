import { UsersPage } from "@features/users";
import { pageTitle } from "@lib/page-title";
import { ROLE_ACCESS, requireRoles } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/usuarios")({
	beforeLoad: requireRoles(ROLE_ACCESS.users),
	head: () => ({ meta: [{ title: pageTitle("Usuários") }] }),
	component: UsersPage,
});
