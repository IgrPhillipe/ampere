import { useAuthStore } from "@features/shared";
import { getRoleHomePath, PASSWORD_CHANGE_PATH } from "@lib/route-guard";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { toast } from "sonner";

import type { LoginResponse } from "../../schemas";

/** Saves the session and opens the role's home page, after login or sign-up. */
export const useStartSession = () => {
	const navigate = useNavigate();
	const setSession = useAuthStore((state) => state.login);

	return useCallback(
		({ token, user }: LoginResponse, redirectTo?: string) => {
			setSession({ ...user, token });
			toast.success(`Bem-vindo, ${user.name}.`);

			if (user.mustChangePassword) {
				navigate({
					to: PASSWORD_CHANGE_PATH,
					search: { redirect: redirectTo },
				});
				return;
			}

			navigate({ to: redirectTo ?? getRoleHomePath(user.role) });
		},
		[navigate, setSession],
	);
};
