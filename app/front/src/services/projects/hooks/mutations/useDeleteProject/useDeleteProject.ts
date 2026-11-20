import { getToastErrorMessage } from "@lib/api-error";
import { dashboardKeys } from "@services/dashboard/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { projectKeys } from "../../../query-keys";
import { deleteProject } from "../../../requests";

interface UseDeleteProjectOptions {
	/** Runs before the cache is cleared, so a page showing the project can leave first. */
	onDeleted?: () => Promise<void> | void;
}

export const useDeleteProject = ({
	onDeleted,
}: UseDeleteProjectOptions = {}) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteProject,
		onSuccess: async (_data, projectId) => {
			await onDeleted?.();
			queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: projectKeys.all() }),
				queryClient.invalidateQueries({ queryKey: dashboardKeys.all() }),
			]);

			toast.success("Projeto excluído.");
		},
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível excluir o projeto.",
				}),
			),
	});
};
