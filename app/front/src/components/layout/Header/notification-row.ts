import dayjs from "@lib/dayjs";

/** "há 2 horas": the panel shows how long ago, not the date. */
export const formatNotificationAge = (createdAt: string, now = dayjs()) =>
	dayjs(createdAt).from(now);

/** Only routes of the app: a link from the API never leaves it. */
export const isAppLink = (link: string) =>
	link.startsWith("/") && !link.startsWith("//");

export const formatUnreadLabel = (count: number) =>
	count === 0
		? "Notificações"
		: `Notificações, ${count} ${count === 1 ? "não lida" : "não lidas"}`;

/** The badge stays narrow: beyond 99 it reads "99+". */
export const formatUnreadBadge = (count: number) =>
	count > 99 ? "99+" : String(count);
