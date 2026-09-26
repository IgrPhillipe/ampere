import { useAuthStore } from "@features/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

export const useLogout = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const clearSession = useAuthStore((state) => state.logout);

	// Navigate first: clearing the token under mounted queries refetches them and toasts a 401.
	return useCallback(() => {
		void navigate({ to: "/login" }).then(() => {
			clearSession();
			queryClient.clear();
		});
	}, [clearSession, queryClient, navigate]);
};
