import { useAuthStore } from "@features/shared";
import { getRoleHomePath } from "@lib/route-guard";
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
			navigate({ to: redirectTo ?? getRoleHomePath(user.role) });
			toast.success(`Bem-vindo, ${user.name}.`);
		},
		[navigate, setSession],
	);
};
