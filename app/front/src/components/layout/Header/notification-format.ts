import dayjs from "@lib/dayjs";

/** "há 2 horas": the panel shows how long ago, not the date. */
export const formatNotificationAge = (createdAt: string, now = dayjs()) =>
	dayjs(createdAt).from(now);

/**
 * The route a notification opens, or null when its link would leave the app.
 * The browser decides: `/\host` looks like a path and still names another host.
 */
export const toAppPath = (link: string, origin = window.location.origin) => {
	try {
		const url = new URL(link, origin);

		return url.origin === origin
			? `${url.pathname}${url.search}${url.hash}`
			: null;
	} catch {
		return null;
	}
};

export const formatUnreadLabel = (count: number) =>
	count === 0
		? "Notificações"
		: `Notificações, ${count} ${count === 1 ? "não lida" : "não lidas"}`;

/** The badge stays narrow: beyond 99 it reads "99+". */
export const formatUnreadBadge = (count: number) =>
	count > 99 ? "99+" : String(count);
