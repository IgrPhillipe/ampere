import { ProfilePage } from "@features/auth";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/meu-perfil")({
	head: () => ({ meta: [{ title: pageTitle("Meu Perfil") }] }),
	component: ProfilePage,
});
