import { useAuthStore } from "@features/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

export const useLogout = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const clearSession = useAuthStore((state) => state.logout);

	return useCallback(() => {
		clearSession();

		// Sem isso os dados do usuario anterior ficam no cache e reaparecem
		// no proximo login antes do refetch.
		queryClient.clear();

		navigate({ to: "/login" });
	}, [clearSession, queryClient, navigate]);
};
