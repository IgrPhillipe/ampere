import { getToastErrorMessage } from "@lib/api-error";
import { projectKeys } from "@services/projects";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectReviewKeys } from "../../../query-keys";
import { createFinding } from "../../../requests";

export const useCreateFinding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createFinding,
		onSuccess: async (_, { projectId }) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: projectReviewKeys.findings(projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: projectKeys.detail(projectId),
				}),
			]);

			toast.success("Apontamento registrado.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível registrar o apontamento.",
				}),
			),
	});
};
