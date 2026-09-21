import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CurrentUser, UserRole } from "../types";

interface AuthState {
	user: CurrentUser | null;
	isAuthenticated: boolean;
	login: (user: CurrentUser) => void;
	logout: () => void;
	setRole: (role: UserRole) => void;
	updateUser: (partial: Partial<CurrentUser>) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			login: (user) => set({ user, isAuthenticated: true }),
			logout: () => set({ user: null, isAuthenticated: false }),
			setRole: (role) =>
				set((state) => ({
					user: state.user ? { ...state.user, role } : null,
				})),
			updateUser: (partial) =>
				set((state) => ({
					user: state.user ? { ...state.user, ...partial } : null,
				})),
		}),
		{
			name: "ampere-auth",
			storage: createJSONStorage(() => localStorage),
		},
	),
);

/** Espera a re-hidratacao do storage antes das guards de rota rodarem. */
export const waitForAuthHydration = (): Promise<void> => {
	if (useAuthStore.persist.hasHydrated()) return Promise.resolve();

	return new Promise((resolve) => {
		const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
			unsubscribe();
			resolve();
		});
	});
};
