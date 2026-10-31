import { LoginPage } from "@features/auth";
import { pageTitle } from "@lib/page-title";
import { redirectSignedIn } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

interface LoginSearch {
	/** Originating route, to return to after signing in. */
	redirect?: string;
}

const LoginRoute = () => {
	const { redirect } = Route.useSearch();

	return <LoginPage redirectTo={redirect} />;
};

export const Route = createFileRoute("/entrar")({
	beforeLoad: redirectSignedIn(),
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	head: () => ({ meta: [{ title: pageTitle("Entrar") }] }),
	component: LoginRoute,
});
