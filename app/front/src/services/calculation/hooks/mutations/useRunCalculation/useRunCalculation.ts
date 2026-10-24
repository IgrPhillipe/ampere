import { padCount } from "@features/shared";
import { getToastErrorMessage } from "@lib/api-error";
import { projectKeys } from "@services/projects";
import { submissionKeys } from "@services/submission";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { calculationKeys } from "../../../query-keys";
import { runCalculation } from "../../../requests";

export const useRunCalculation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: runCalculation,
		onSuccess: async (response, projectId) => {
			queryClient.setQueryData(calculationKeys.latest(projectId), response);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: projectKeys.all() }),
				queryClient.invalidateQueries({
					queryKey: submissionKeys.checklist(projectId),
				}),
				queryClient.invalidateQueries({
					queryKey: submissionKeys.memorial(projectId),
				}),
			]);

			const { checksCount, warningsCount } = response.data;
			const outcome =
				warningsCount === 0
					? "nenhuma inconsistência"
					: `${padCount(warningsCount)} ${warningsCount === 1 ? "alerta" : "alertas"}`;
			toast.success("Demanda calculada", {
				description: `${padCount(checksCount)} conferências, ${outcome}`,
			});
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível calcular a demanda.",
				}),
			),
	});
};
