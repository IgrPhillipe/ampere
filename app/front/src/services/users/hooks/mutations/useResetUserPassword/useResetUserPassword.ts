import { getToastErrorMessage } from "@lib/api-error";
import { dashboardKeys } from "@services/dashboard/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userKeys } from "../../../query-keys";
import { resetUserPassword } from "../../../requests";

export const useResetUserPassword = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resetUserPassword,
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
				queryClient.invalidateQueries({ queryKey: dashboardKeys.all() }),
			]),
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível redefinir a senha.",
				}),
			),
	});
};
