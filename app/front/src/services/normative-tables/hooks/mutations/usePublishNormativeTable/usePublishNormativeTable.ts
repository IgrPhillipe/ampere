import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normativeTableKeys } from "../../../query-keys";
import { publishNormativeTable } from "../../../requests";

export const usePublishNormativeTable = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: publishNormativeTable,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: normativeTableKeys.all(),
			});

			toast.success("Revisão aprovada e publicada.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível aprovar a revisão.",
				}),
			),
	});
};
