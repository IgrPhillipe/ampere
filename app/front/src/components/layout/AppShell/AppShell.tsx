import { Outlet } from "@tanstack/react-router";

import { AppLayout } from "../AppLayout";

/** Casca das rotas autenticadas: sidebar, header e footer em volta do Outlet. */
export const AppShell = () => (
	<AppLayout>
		<Outlet />
	</AppLayout>
);
