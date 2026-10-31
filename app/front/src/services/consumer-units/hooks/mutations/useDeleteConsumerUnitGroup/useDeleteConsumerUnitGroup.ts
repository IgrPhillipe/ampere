import { getToastErrorMessage } from "@lib/api-error";
import { calculationKeys } from "@services/calculation";
import { projectKeys } from "@services/projects";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { consumerUnitGroupKeys } from "../../../query-keys";
import { deleteConsumerUnitGroup } from "../../../requests";

export const useDeleteConsumerUnitGroup = (projectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteConsumerUnitGroup,
		onSuccess: async () => {
			// `project()` also refreshes the step validation; the latest calculation may now be outdated.
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: consumerUnitGroupKeys.project(projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: calculationKeys.latest(projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: projectKeys.detail(projectId),
				}),
			]);

			toast.success("Grupo excluído.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível excluir o grupo.",
				}),
			),
	});
};
