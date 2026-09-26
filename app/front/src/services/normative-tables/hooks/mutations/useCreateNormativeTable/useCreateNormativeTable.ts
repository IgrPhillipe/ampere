import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normativeTableKeys } from "../../../query-keys";
import { createNormativeTable } from "../../../requests";

export const useCreateNormativeTable = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createNormativeTable,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: normativeTableKeys.all(),
			});

			toast.success("Tabela salva.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível salvar a tabela.",
				}),
			),
	});
};
