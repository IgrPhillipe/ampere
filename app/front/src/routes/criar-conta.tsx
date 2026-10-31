import { RegisterPage } from "@features/auth";
import { pageTitle } from "@lib/page-title";
import { redirectSignedIn } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/criar-conta")({
	beforeLoad: redirectSignedIn(),
	head: () => ({ meta: [{ title: pageTitle("Criar Conta") }] }),
	component: RegisterPage,
});
