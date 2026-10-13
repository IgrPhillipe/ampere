import { getToastErrorMessage } from "@lib/api-error";
import { projectKeys } from "@services/projects";
import { reviewQueueKeys } from "@services/review-queue";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectReviewKeys } from "../../../query-keys";
import { decideProjectReview } from "../../../requests";

export const useDecideProjectReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: decideProjectReview,
		onSuccess: async (_, { projectId, decision }) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: projectKeys.all() }),
				queryClient.invalidateQueries({ queryKey: reviewQueueKeys.all() }),
				queryClient.invalidateQueries({
					queryKey: projectReviewKeys.findings(projectId),
				}),
			]);

			toast.success(
				decision === "APPROVE"
					? "Projeto aprovado."
					: "Projeto reprovado com apontamentos.",
			);
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível registrar a decisão.",
				}),
			),
	});
};
