import {
	getApiFieldErrors,
	getHttpStatus,
	getToastErrorMessage,
} from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userKeys } from "../../../query-keys";
import { updateUser } from "../../../requests";

interface UseUpdateUserOptions {
	successMessage?: string;
	errorFallback?: string;
}

/** Edits, deactivations and reactivations all go through `PUT /users/{id}`. */
export const useUpdateUser = ({
	successMessage = "Alterações salvas.",
	errorFallback = "Não foi possível salvar o usuário.",
}: UseUpdateUserOptions = {}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateUser,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
			toast.success(successMessage);
		},
		onError: (error) => {
			// The form shows these on the fields.
			if (getHttpStatus(error) === 409 || getApiFieldErrors(error).length) {
				return;
			}

			toast.error(getToastErrorMessage(error, { fallback: errorFallback }));
		},
	});
};
