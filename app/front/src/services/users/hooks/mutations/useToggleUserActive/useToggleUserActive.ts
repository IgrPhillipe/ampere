import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { userKeys } from "../../../query-keys";
import { updateUser } from "../../../requests";
import type { ManagedUser } from "../../../schemas";

/** Deactivates an active account or reactivates an inactive one, keeping name and role. */
export const useToggleUserActive = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, name, role, active }: ManagedUser) =>
			updateUser({ id, payload: { name, role, active: !active } }),
		onSuccess: async ({ data }) => {
			await queryClient.invalidateQueries({ queryKey: userKeys.lists() });
			toast.success(data.active ? "Usuário reativado." : "Usuário desativado.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível alterar a situação do usuário.",
				}),
			),
	});
};
