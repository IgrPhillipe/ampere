import { getToastErrorMessage } from "@lib/api-error";
import { dashboardKeys } from "@services/dashboard/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectKeys } from "../../../query-keys";
import { createProject } from "../../../requests";

export const useCreateProject = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createProject,
		onSuccess: async () => {
			// `all()`, not `lists()`: the status counters are a query of their own.
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: projectKeys.all() }),
				queryClient.invalidateQueries({ queryKey: dashboardKeys.all() }),
			]);

			toast.success("Projeto criado.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível criar o projeto.",
				}),
			),
	});
};
