import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectKeys } from "../../../query-keys";
import { submitProject } from "../../../requests";

export const useSubmitProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => submitProject(id),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: projectKeys.all(),
			});

			toast.success("Projeto enviado para análise.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível enviar o projeto.",
				}),
			),
	});
};
