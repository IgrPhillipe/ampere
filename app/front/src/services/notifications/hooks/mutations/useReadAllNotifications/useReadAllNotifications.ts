import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationKeys } from "../../../query-keys";
import { readAllNotifications } from "../../../requests";

export const useReadAllNotifications = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: notificationKeys.readAll(),
		mutationFn: readAllNotifications,
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: notificationKeys.all() }),
		onError: (error) =>
			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível marcar as notificações como lidas.",
				}),
			),
	});
};
