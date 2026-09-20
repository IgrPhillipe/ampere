import { AppShell } from "@components/layout";
import { requireAuth } from "@lib/route-guard";
import {
	createRootRoute,
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
			{PUBLIC_PATHS.includes(pathname) ? <Outlet /> : <AppShell />}
		</NuqsAdapter>
	);
};

export const Route = createRootRoute({
	beforeLoad: async ({ location }) => {
		if (PUBLIC_PATHS.includes(location.pathname)) return;

		await requireAuth()();
	},
	component: RootComponent,
});
