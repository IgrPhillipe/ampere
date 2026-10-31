import { ChangePasswordPage } from "@features/auth";
import { pageTitle } from "@lib/page-title";
import { requirePendingPasswordChange } from "@lib/route-guard";
import { createFileRoute } from "@tanstack/react-router";

interface ChangePasswordSearch {
	redirect?: string;
}

const ChangePasswordRoute = () => {
	const { redirect } = Route.useSearch();

	return <ChangePasswordPage redirectTo={redirect} />;
};

export const Route = createFileRoute("/trocar-senha")({
	beforeLoad: requirePendingPasswordChange(),
	validateSearch: (search: Record<string, unknown>): ChangePasswordSearch => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	head: () => ({ meta: [{ title: pageTitle("Troca de Senha") }] }),
	component: ChangePasswordRoute,
});
