import { AppShell } from "@components/layout";
import { requireAuth } from "@lib/route-guard";
import {
	createRootRoute,
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
