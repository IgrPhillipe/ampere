import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { submissionKeys } from "../../../query-keys";
import { uploadDocument } from "../../../requests";

export const useUploadDocument = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: uploadDocument,
		onSuccess: async ({ data }, { projectId }) => {
			await queryClient.invalidateQueries({
				queryKey: submissionKeys.checklist(projectId),
			});

			toast.success(`${data.typeLabel} anexado.`);
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível anexar o documento.",
				}),
			),
	});
};
