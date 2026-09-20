import type { UserRole } from "@features/shared";
import { useAuthStore, waitForAuthHydration } from "@features/shared";
import { redirect } from "@tanstack/react-router";

/** Para onde mandar cada papel quando ele cai numa rota que nao pode ver. */
const ROLE_FALLBACK: Record<UserRole, string> = {
	admin: "/",
	user: "/",
};

/** Usar em `beforeLoad` de rota que exige sessao. */
export const requireAuth = () => async () => {
	await waitForAuthHydration();

	const { isAuthenticated, user } = useAuthStore.getState();

	if (!isAuthenticated || !user) {
		throw redirect({ to: "/login", search: { redirect: location.pathname } });
	}
};

/** Usar em `beforeLoad` de rota restrita a papeis especificos. */
export const requireRoles =
	(roles: UserRole[], fallback?: string) => async () => {
		await waitForAuthHydration();

		const { user } = useAuthStore.getState();

		if (!user) {
			throw redirect({ to: "/login", search: { redirect: location.pathname } });
		}

		if (!roles.includes(user.role)) {
			throw redirect({ to: fallback ?? ROLE_FALLBACK[user.role] });
		}
	};
