import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { submissionKeys } from "../../../query-keys";
import { deleteDocument } from "../../../requests";

export const useDeleteDocument = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteDocument,
		onSuccess: async (_data, { projectId }) => {
			await queryClient.invalidateQueries({
				queryKey: submissionKeys.checklist(projectId),
			});

			toast.success("Documento removido.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível remover o documento.",
				}),
			),
	});
};
