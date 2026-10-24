import { getToastErrorMessage } from "@lib/api-error";
import { projectKeys } from "@services/projects";
import { submissionKeys } from "@services/submission";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectReviewKeys } from "../../../query-keys";
import { respondFinding } from "../../../requests";

export const useRespondFinding = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: respondFinding,
		onSuccess: async (_, { projectId, status }) => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: projectReviewKeys.findings(projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: projectKeys.detail(projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: submissionKeys.checklist(projectId),
				}),
			]);

			toast.success(
				status === "FIXED"
					? "Apontamento marcado como corrigido."
					: "Contestação registrada.",
			);
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível responder ao apontamento.",
				}),
			),
	});
};
