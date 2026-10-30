import { RegisterPage } from "@features/auth";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/criar-conta")({
	head: () => ({ meta: [{ title: pageTitle("Criar Conta") }] }),
	component: RegisterPage,
});
