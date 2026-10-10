import type { UserRole } from "@features/shared";
import { useAuthStore, waitForAuthHydration } from "@features/shared";
import { redirect } from "@tanstack/react-router";

/** Where to send each role when it lands on a route it cannot see. */
const ROLE_FALLBACK: Record<UserRole, string> = {
	admin: "/fila-de-analise",
	user: "/projetos",
};

export const getRoleHomePath = (role: UserRole) => ROLE_FALLBACK[role];

/** Use in the `beforeLoad` of a route that requires a session. */
export const requireAuth = () => async () => {
	await waitForAuthHydration();

	const { isAuthenticated, user } = useAuthStore.getState();

	if (!isAuthenticated || !user) {
		throw redirect({ to: "/entrar", search: { redirect: location.pathname } });
	}
};

/** `/` has no page of its own: it sends each role to its home. */
export const redirectToRoleHome = () => async () => {
	await waitForAuthHydration();

	const { user } = useAuthStore.getState();

	throw redirect({ to: user ? getRoleHomePath(user.role) : "/entrar" });
};

/** Use in the `beforeLoad` of a route restricted to specific roles. */
export const requireRoles =
	(roles: UserRole[], fallback?: string) => async () => {
		await waitForAuthHydration();

		const { user } = useAuthStore.getState();

		if (!user) {
			throw redirect({
				to: "/entrar",
				search: { redirect: location.pathname },
			});
		}

		if (!roles.includes(user.role)) {
			throw redirect({ to: fallback ?? getRoleHomePath(user.role) });
		}
	};
