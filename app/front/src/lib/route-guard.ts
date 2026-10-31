import type { UserRole } from "@features/shared";
import { useAuthStore, waitForAuthHydration } from "@features/shared";
import { type ParsedLocation, redirect } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
	interface HistoryState {
		/** Set by the logout, which leaves the page before it clears the session. */
		signingOut?: boolean;
	}
}

/** Who reaches each area: the same split the back enforces. */
export const ROLE_ACCESS = {
	projects: ["user", "admin"],
	/** The project page itself: the analyst reads and reviews it there. */
	projectWorkspace: ["user", "reviewer", "admin"],
	reviewQueue: ["reviewer", "admin"],
	normativeTables: ["reviewer", "admin"],
} as const satisfies Record<string, readonly UserRole[]>;

/** Where to send each role when it lands on a route it cannot see. */
const ROLE_FALLBACK: Record<UserRole, string> = {
	user: "/projetos",
	reviewer: "/fila-de-analise",
	admin: "/projetos",
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

/** Use in the `beforeLoad` of `/entrar` and `/criar-conta`: whoever is signed in goes home. */
export const redirectSignedIn =
	() =>
	async ({ location }: { location: ParsedLocation }) => {
		if (location.state.signingOut) return;

		await waitForAuthHydration();

		const { isAuthenticated, user } = useAuthStore.getState();

		if (isAuthenticated && user) {
			throw redirect({ to: getRoleHomePath(user.role) });
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
	(roles: readonly UserRole[], fallback?: string) => async () => {
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
