import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { consumerUnitGroupKeys } from "../../../query-keys";
import { createConsumerUnitGroup } from "../../../requests";

export const useCreateConsumerUnitGroup = (projectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createConsumerUnitGroup,
		onSuccess: async () => {
			// `project()` also refreshes the step validation.
			await queryClient.invalidateQueries({
				queryKey: consumerUnitGroupKeys.project(projectId),
			});

			toast.success("Grupo salvo.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível salvar o grupo.",
				}),
			),
	});
};
