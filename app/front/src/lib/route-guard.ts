import type { UserRole } from "@features/shared";
import { useAuthStore, waitForAuthHydration } from "@features/shared";
import { redirect } from "@tanstack/react-router";

/** Where to send each role when it lands on a route it cannot see. */
const ROLE_FALLBACK: Record<UserRole, string> = {
	admin: "/",
	user: "/",
};

/** Use in the `beforeLoad` of a route that requires a session. */
export const requireAuth = () => async () => {
	await waitForAuthHydration();

	const { isAuthenticated, user } = useAuthStore.getState();

	if (!isAuthenticated || !user) {
		throw redirect({ to: "/login", search: { redirect: location.pathname } });
	}
};

/** Use in the `beforeLoad` of a route restricted to specific roles. */
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
