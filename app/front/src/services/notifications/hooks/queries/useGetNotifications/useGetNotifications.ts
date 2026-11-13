import { useQuery } from "@tanstack/react-query";

import { notificationKeys } from "../../../query-keys";
import { getNotifications } from "../../../requests";

interface UseGetNotificationsOptions {
	enabled?: boolean;
}

/** The bell list; `useRefreshNotificationsOnNavigation` keeps it current. */
export const useGetNotifications = ({
	enabled = true,
}: UseGetNotificationsOptions = {}) =>
	useQuery({
		queryKey: notificationKeys.list(),
		queryFn: getNotifications,
		enabled,
	});
