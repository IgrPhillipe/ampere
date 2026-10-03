import { getToastErrorMessage } from "@lib/api-error";
import { projectKeys } from "@services/projects";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { submissionKeys } from "../../../query-keys";
import { submitProject } from "../../../requests";

export const useSubmitProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: submitProject,
		onSuccess: async (response, projectId) => {
			queryClient.setQueryData(projectKeys.detail(projectId), response);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: projectKeys.all() }),
				queryClient.invalidateQueries({
					queryKey: submissionKeys.checklist(projectId),
				}),
			]);
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível enviar o projeto.",
				}),
			),
	});
};
