import { useAuthStore } from "@features/shared";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppLayout } from "../AppLayout";

/**
 * Casca das rotas autenticadas: cabeçalho e conteúdo.
 *
 * Também é onde a sessão que cai no meio do caminho vira navegação. A guard de
 * rota só roda no `beforeLoad`, então o token que o servidor recusa enquanto a
 * pessoa já está numa tela derrubava a sessão sem tirar ninguém do lugar: a tela
 * ficava mostrando erro, com um aviso para entrar de novo e sem caminho para
 * fazer isso.
 */
export const AppShell = () => {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	useEffect(() => {
		if (isAuthenticated) return;

		void navigate({ to: "/login", search: { redirect: pathname } });
	}, [isAuthenticated, navigate, pathname]);

	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
};
