import { getToastErrorMessage } from "@lib/api-error";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { notificationKeys } from "../../../query-keys";
import { readNotification } from "../../../requests";
import type { NotificationList } from "../../../schemas";

type NotificationListCache = { data: NotificationList } | undefined;

const markRead = (current: NotificationListCache, id: string) => {
	const target = current?.data.items.find((item) => item.id === id);

	if (!current || !target || target.read) return current;

	return {
		...current,
		data: {
			unreadCount: Math.max(0, current.data.unreadCount - 1),
			items: current.data.items.map((item) =>
				item.id === id ? { ...item, read: true } : item,
			),
		},
	};
};

/** Marks it read at once: the user is already on the way to the project. */
export const useReadNotification = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationKey: notificationKeys.read(),
		mutationFn: readNotification,
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

			const previous = queryClient.getQueryData<NotificationListCache>(
				notificationKeys.list(),
			);
			queryClient.setQueryData<NotificationListCache>(
				notificationKeys.list(),
				(current) => markRead(current, id),
			);

			return { previous };
		},
		onError: (error, _id, context) => {
			queryClient.setQueryData(notificationKeys.list(), context?.previous);

			toast.error(
				getToastErrorMessage(error, {
					fallback: "Não foi possível marcar a notificação como lida.",
				}),
			);
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: notificationKeys.all() }),
	});
};
