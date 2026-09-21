import { AppShell } from "@components/layout";
import { pageTitle } from "@lib/page-title";
import { requireAuth } from "@lib/route-guard";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";

/** Routes that need no session. Everything else goes through the guard. */
const PUBLIC_PATHS = ["/login"];

const RootComponent = () => {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	return (
		<NuqsAdapter>
			{/* Escreve title e meta da rota ativa no documento. Sem isto o `head`
			    declarado em cada rota nao chega a lugar nenhum. */}
			<HeadContent />

			{PUBLIC_PATHS.includes(pathname) ? <Outlet /> : <AppShell />}
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
		if (PUBLIC_PATHS.includes(location.pathname)) return;

		await requireAuth()();
	},
	component: RootComponent,
});
