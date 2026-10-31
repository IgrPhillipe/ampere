import { AppShell } from "@components/layout";
import { pageTitle } from "@lib/page-title";
import { PASSWORD_CHANGE_PATH, requireAuth } from "@lib/route-guard";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

/** Routes that need no session. Everything else goes through the guard. */
const PUBLIC_PATHS = ["/criar-conta", "/entrar"];

/** Rendered without the app shell; each one guards itself. */
const STANDALONE_PATHS = [...PUBLIC_PATHS, PASSWORD_CHANGE_PATH];

const RootComponent = () => {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	return (
		<NuqsAdapter>
			{/* Escreve title e meta da rota ativa no documento. Sem isto o `head`
			    declarado em cada rota nao chega a lugar nenhum. */}
			<HeadContent />

			{STANDALONE_PATHS.includes(pathname) ? <Outlet /> : <AppShell />}
		</NuqsAdapter>
	);
};

export const Route = createRootRoute({
	// Padrao herdado por qualquer rota sem `head` proprio.
	head: () => ({
		meta: [
			{ title: pageTitle() },
			{
				name: "description",
				content:
					"Projetos elétricos da Neoenergia Pernambuco: acompanhamento, cálculo de demanda e envio.",
			},
		],
	}),
	beforeLoad: async ({ location }) => {
		if (STANDALONE_PATHS.includes(location.pathname)) return;

		await requireAuth()({ location });
	},
	component: RootComponent,
});
