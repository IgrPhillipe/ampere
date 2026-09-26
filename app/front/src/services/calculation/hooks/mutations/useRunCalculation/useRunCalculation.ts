import { padCount } from "@features/shared";
import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { calculationKeys } from "../../../query-keys";
import { runCalculation } from "../../../requests";

export const useRunCalculation = (projectId: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => runCalculation(projectId),
		onSuccess: (response) => {
			queryClient.setQueryData(calculationKeys.latest(projectId), response);

			const { checksCount, warningsCount } = response.data;
			const outcome =
				warningsCount === 0
					? "nenhuma inconsistência"
					: `${padCount(warningsCount)} ${warningsCount === 1 ? "alerta" : "alertas"}`;
			toast.success("Verificação automática concluída", {
				description: `${padCount(checksCount)} conferências · ${outcome}`,
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
