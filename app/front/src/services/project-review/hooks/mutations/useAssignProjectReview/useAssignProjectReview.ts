import { getHttpStatus, getToastErrorMessage } from "@lib/api-error";
import { projectEventKeys } from "@services/project-events";
import { reviewQueueKeys } from "@services/review-queue";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { assignProjectReview } from "../../../requests";

export const useAssignProjectReview = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: assignProjectReview,
		onSuccess: (_, projectId) =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: reviewQueueKeys.all() }),
				queryClient.invalidateQueries({
					queryKey: projectEventKeys.project(projectId),
				}),
			]),
		onError: (error) => {
			if (getHttpStatus(error) === 409) return;

			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível assumir a análise do projeto.",
				}),
			);
		},
	});
};
