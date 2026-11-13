import { useQuery } from "@tanstack/react-query";

import { notificationKeys } from "../../../query-keys";
import { getNotifications } from "../../../requests";

interface UseGetNotificationsOptions {
	enabled?: boolean;
}

/** No push: the bell refreshes when the user navigates or comes back to the tab. */
export const useGetNotifications = ({
	enabled = true,
}: UseGetNotificationsOptions = {}) =>
	useQuery({
		queryKey: notificationKeys.list(),
		queryFn: getNotifications,
		enabled,
	});
