import { useAuthStore } from "@features/shared";
import { PASSWORD_CHANGE_PATH } from "@lib/route-guard";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppLayout } from "../AppLayout";

export const AppShell = () => {
	const navigate = useNavigate();
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const mustChangePassword = useAuthStore(
		(state) => state.user?.mustChangePassword ?? false,
	);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	useEffect(() => {
		if (!isAuthenticated) {
			void navigate({ to: "/entrar", search: { redirect: pathname } });
			return;
		}

		// A password reset while the session is open lands here through the API's 403.
		if (mustChangePassword) {
			void navigate({
				to: PASSWORD_CHANGE_PATH,
				search: { redirect: pathname },
			});
		}
	}, [isAuthenticated, mustChangePassword, navigate, pathname]);

	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
};
