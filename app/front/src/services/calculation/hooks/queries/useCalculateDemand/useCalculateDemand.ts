import { padCount } from "@features/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { calculationKeys } from "../../../query-keys";
import { runCalculation } from "../../../requests";

/**
 * Recalculates a draft each time step 3 opens. A query and not a mutation:
 * StrictMode remounts would detach a mutation fired on mount from the screen.
 */
export const useCalculateDemand = (
	projectId: string,
	{ enabled = true }: { enabled?: boolean } = {},
) => {
	const queryClient = useQueryClient();

	return useQuery({
		queryKey: calculationKeys.run(projectId),
		queryFn: async () => {
			const response = await runCalculation(projectId);
			queryClient.setQueryData(calculationKeys.latest(projectId), response);

			const { checksCount, warningsCount } = response.data;
			const outcome =
				warningsCount === 0
					? "nenhuma inconsistência"
					: `${padCount(warningsCount)} ${warningsCount === 1 ? "alerta" : "alertas"}`;
			toast.success("Verificação automática concluída", {
				description: `${padCount(checksCount)} conferências, ${outcome}`,
			});

			return response;
		},
		enabled,
		retry: false,
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: false,
	});
};
