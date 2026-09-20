import { Outlet } from "@tanstack/react-router";

import { AppLayout } from "../AppLayout";

/** Casca das rotas autenticadas: cabeçalho e conteúdo. */
export const AppShell = () => (
	<AppLayout>
		<Outlet />
	</AppLayout>
);
