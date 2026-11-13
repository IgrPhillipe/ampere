import { getHttpStatus, getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { reviewerDistributionKeys } from "../../../query-keys";
import { updateReviewerMunicipalities } from "../../../requests";

/** The municipality went to someone else, or the analyst is gone or inactive. */
const STALE_STATUSES = new Set([404, 409, 422]);

/** A 409 names the analyst who already holds the municipality. */
export const useUpdateReviewerMunicipalities = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateReviewerMunicipalities,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: reviewerDistributionKeys.all(),
			});
			toast.success("Municípios do analista atualizados.");
		},
		onError: (error) => {
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível salvar os municípios do analista.",
				}),
			);
			const status = getHttpStatus(error);
			if (status !== undefined && STALE_STATUSES.has(status)) {
				void queryClient.invalidateQueries({
					queryKey: reviewerDistributionKeys.all(),
				});
			}
		},
	});
};
