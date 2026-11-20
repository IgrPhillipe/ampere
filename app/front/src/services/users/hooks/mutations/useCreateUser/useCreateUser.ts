import {
	getApiFieldErrors,
	getHttpStatus,
	getToastErrorMessage,
} from "@lib/api-error";
import { dashboardKeys } from "@services/dashboard/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userKeys } from "../../../query-keys";
import { createUser } from "../../../requests";

export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createUser,
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
				queryClient.invalidateQueries({ queryKey: dashboardKeys.all() }),
			]),
		onError: (error) => {
			// The form shows these on the fields.
			if (getHttpStatus(error) === 409 || getApiFieldErrors(error).length) {
				return;
			}

			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível criar o usuário.",
				}),
			);
		},
	});
};
