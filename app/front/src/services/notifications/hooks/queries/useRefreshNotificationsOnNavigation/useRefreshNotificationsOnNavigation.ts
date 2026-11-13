import { useQueryClient } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { notificationKeys } from "../../../query-keys";

/**
 * No push: each change of route brings the bell up to date. The first render
 * already fetches, and a disabled list (password change pending) stays quiet.
 */
export const useRefreshNotificationsOnNavigation = () => {
	const queryClient = useQueryClient();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const lastPathname = useRef(pathname);

	useEffect(() => {
		if (lastPathname.current === pathname) return;

		lastPathname.current = pathname;
		// A read in flight already refreshes the bell when it settles.
		if (queryClient.isMutating({ mutationKey: notificationKeys.all() })) return;

		void queryClient.refetchQueries({
			queryKey: notificationKeys.list(),
			type: "active",
		});
	}, [pathname, queryClient]);
};
