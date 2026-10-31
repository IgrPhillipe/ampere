import {
	getApiFieldErrors,
	getHttpStatus,
	getToastErrorMessage,
} from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userKeys } from "../../../query-keys";
import { updateUser } from "../../../requests";

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateUser,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
			toast.success("Alterações salvas.");
		},
		onError: (error) => {
			// The form shows these on the fields.
			if (getHttpStatus(error) === 409 || getApiFieldErrors(error).length) {
				return;
			}

			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível salvar o usuário.",
				}),
			);
		},
	});
};
