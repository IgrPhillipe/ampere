import { useAuthStore } from "@features/shared";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppLayout } from "../AppLayout";

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
