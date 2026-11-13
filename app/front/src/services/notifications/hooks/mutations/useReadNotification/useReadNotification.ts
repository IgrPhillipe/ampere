import { useMutation, useQueryClient } from "@tanstack/react-query";

import { notificationKeys } from "../../../query-keys";
import { readNotification } from "../../../requests";
import type { NotificationList } from "../../../schemas";

type NotificationListCache = { data: NotificationList } | undefined;

/** Marks it read at once: the user is already on the way to the project. */
export const useReadNotification = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: readNotification,
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: notificationKeys.list() });

			queryClient.setQueryData<NotificationListCache>(
				notificationKeys.list(),
				(current) => {
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
				},
			);
		},
		onSettled: () =>
			queryClient.invalidateQueries({ queryKey: notificationKeys.all() }),
	});
};
