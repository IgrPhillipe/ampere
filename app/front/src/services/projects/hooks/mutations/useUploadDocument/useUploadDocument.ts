import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectKeys } from "../../../query-keys";
import { uploadDocument } from "../../../requests";

export const useUploadDocument = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			docType,
			file,
		}: {
			id: string;
			docType: string;
			file: File;
		}) => uploadDocument({ id, docType, file }),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({
				queryKey: projectKeys.detail(variables.id),
			});

			toast.success("Documento anexado com sucesso.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível anexar o documento.",
				}),
			),
	});
};
