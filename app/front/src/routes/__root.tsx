import { AppShell } from "@components/layout";
import { requireAuth } from "@lib/route-guard";
import {
	createRootRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";

/** Rotas que dispensam sessao. Tudo fora desta lista passa pela guard. */
const PUBLIC_PATHS = ["/login"];

/**
 * Declarado antes de `Route`: `createRootRoute` roda na avaliacao do modulo
 * e leria a const antes da inicializacao.
 */
const RootComponent = () => {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	// A tela de login nao usa a casca do app.
	if (PUBLIC_PATHS.includes(pathname)) return <Outlet />;

	return <AppShell />;
};

export const Route = createRootRoute({
	beforeLoad: async ({ location }) => {
		if (PUBLIC_PATHS.includes(location.pathname)) return;

		await requireAuth()();
	},
	component: RootComponent,
});
