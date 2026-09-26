import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectKeys } from "../../../query-keys";
import { updateProject } from "../../../requests";

export const useUpdateProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateProject,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: projectKeys.all() });

			toast.success("Dados da edificação atualizados.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível atualizar o projeto.",
				}),
			),
	});
};
