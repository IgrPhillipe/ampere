import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { reviewerDistributionKeys } from "../../../query-keys";
import { updateReviewerMunicipalities } from "../../../requests";

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
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível salvar os municípios do analista.",
				}),
			),
	});
};
