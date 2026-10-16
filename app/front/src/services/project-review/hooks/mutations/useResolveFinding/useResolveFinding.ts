import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectReviewKeys } from "../../../query-keys";
import { resolveFinding } from "../../../requests";

export const useResolveFinding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resolveFinding,
		onSuccess: async (_, { projectId, resolution }) => {
			await queryClient.invalidateQueries({
				queryKey: projectReviewKeys.findings(projectId),
			});

			toast.success(
				resolution === "ACCEPT" ? "Correção aceita." : "Apontamento reaberto.",
			);
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível atualizar o apontamento.",
				}),
			),
	});
};
