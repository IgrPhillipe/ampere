import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { consumerUnitGroupKeys } from "../../../query-keys";
import { updateConsumerUnitGroup } from "../../../requests";

export const useUpdateConsumerUnitGroup = (projectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateConsumerUnitGroup,
		onSuccess: async () => {
			// `project()` also refreshes the step validation.
			await queryClient.invalidateQueries({
				queryKey: consumerUnitGroupKeys.project(projectId),
			});

			toast.success("Grupo atualizado.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível atualizar o grupo.",
				}),
			),
	});
};
