import { Outlet } from "@tanstack/react-router";

import { AppLayout } from "../AppLayout";

/** Casca das rotas autenticadas: cabeçalho, conteúdo e rodapé. */
export const AppShell = () => (
	<AppLayout>
		<Outlet />
	</AppLayout>
);
