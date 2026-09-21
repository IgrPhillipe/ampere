import { LoginPage } from "@features/auth";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

interface LoginSearch {
	/** Rota de origem, para voltar depois de entrar. */
	redirect?: string;
}

const LoginRoute = () => {
	const { redirect } = Route.useSearch();

	return <LoginPage redirectTo={redirect} />;
};

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	head: () => ({ meta: [{ title: pageTitle("Entrar") }] }),
	component: LoginRoute,
});
