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

/** Rotas que dispensam sessao. Tudo fora desta lista passa pela guard. */
const PUBLIC_PATHS = ["/login"];

/**
 * Declarado antes de `Route`: `createRootRoute` roda na avaliacao do modulo
 * e leria a const antes da inicializacao.
 */
const RootComponent = () => {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	// A tela de login nao usa a casca do app.
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
