import { useAuthStore } from "@features/shared";
import { getApiFieldErrors, getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userKeys } from "../../../query-keys";
import { updateProfile } from "../../../requests";

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();
	const updateUser = useAuthStore((state) => state.updateUser);

	return useMutation({
		mutationFn: updateProfile,
		onSuccess: async ({ data }) => {
			updateUser({ name: data.name });
			await queryClient.invalidateQueries({ queryKey: userKeys.profile() });
			toast.success("Alterações salvas com sucesso.");
		},
		onError: (error) => {
			// The form shows these on the fields.
			if (getApiFieldErrors(error).length) return;

			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível salvar as alterações do perfil.",
				}),
			);
		},
	});
};
