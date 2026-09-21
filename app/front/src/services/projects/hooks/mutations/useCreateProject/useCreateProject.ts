import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectKeys } from "../../../query-keys";
import { createProject } from "../../../requests";

export const useCreateProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createProject,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: projectKeys.lists(),
			});

			toast.success("Projeto criado.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível criar o projeto.",
				}),
			),
	});
};
