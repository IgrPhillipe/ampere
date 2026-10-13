import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectReviewKeys } from "../../../query-keys";
import { createFinding } from "../../../requests";

export const useCreateFinding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createFinding,
		onSuccess: async (_, { projectId }) => {
			await queryClient.invalidateQueries({
				queryKey: projectReviewKeys.findings(projectId),
			});

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
