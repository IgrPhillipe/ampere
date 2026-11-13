import { VerifyAuthenticityPage } from "@features/memorial-verification";
import { pageTitle } from "@lib/page-title";
import { createFileRoute } from "@tanstack/react-router";

interface VerifySearch {
	/** The footer code, filled in by the links of the version list. */
	codigo?: string;
}

const VerifyRoute = () => {
	const { codigo } = Route.useSearch();

	return <VerifyAuthenticityPage initialCode={codigo} />;
};

export const Route = createFileRoute("/verificar-autenticidade")({
	validateSearch: (search: Record<string, unknown>): VerifySearch => ({
		codigo: typeof search.codigo === "string" ? search.codigo : undefined,
	}),
	head: () => ({ meta: [{ title: pageTitle("Verificar Autenticidade") }] }),
	component: VerifyRoute,
});
