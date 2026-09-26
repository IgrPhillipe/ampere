import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normativeTableKeys } from "../../../query-keys";
import { updateNormativeTable } from "../../../requests";

export const useUpdateNormativeTable = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateNormativeTable,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: normativeTableKeys.all(),
			});

			toast.success("Rascunho salvo.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível salvar a tabela.",
				}),
			),
	});
};
