import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectReviewKeys } from "../../../query-keys";
import { deleteFinding } from "../../../requests";

export const useDeleteFinding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteFinding,
		onSuccess: async (_, { projectId }) => {
			await queryClient.invalidateQueries({
				queryKey: projectReviewKeys.findings(projectId),
			});

			toast.success("Apontamento excluído.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível excluir o apontamento.",
				}),
			),
	});
};
