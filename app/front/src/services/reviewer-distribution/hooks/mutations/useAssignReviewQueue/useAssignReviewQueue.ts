import { getHttpStatus, getToastErrorMessage } from "@lib/api-error";
import { projectKeys } from "@services/projects";
import { reviewQueueKeys } from "@services/review-queue";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { assignReviewQueue } from "../../../requests";

/** The queue or the analysts changed under the manager: missing, out of review or inactive. */
const STALE_STATUSES = new Set([404, 409, 422]);

export const useAssignReviewQueue = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: assignReviewQueue,
		onSuccess: async (_, { projectIds }) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: reviewQueueKeys.all() }),
				...projectIds.map((id) =>
					queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) }),
				),
			]);
			toast.success(
				projectIds.length === 1
					? "Projeto atribuído."
					: `${projectIds.length} projetos atribuídos.`,
			);
		},
		onError: (error) => {
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível atribuir os projetos.",
				}),
			);
			const status = getHttpStatus(error);
			if (status !== undefined && STALE_STATUSES.has(status)) {
				void queryClient.invalidateQueries({ queryKey: reviewQueueKeys.all() });
			}
		},
	});
};
