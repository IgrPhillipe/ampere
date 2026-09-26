import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { normativeTableKeys } from "../../../query-keys";
import { deleteNormativeTable } from "../../../requests";

export const useDeleteNormativeTable = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteNormativeTable,
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: normativeTableKeys.all(),
			});

			toast.success("Tabela excluída.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível excluir a tabela.",
				}),
			),
	});
};
