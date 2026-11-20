import { http } from "@lib/http";

import { NotificationEndpoints as e } from "./endpoints";
import {
	notificationListResponseSchema,
	notificationResponseSchema,
} from "./schemas";

export const getNotifications = async () => {
	const response = await http.get(e.list).json<unknown>();

	return notificationListResponseSchema.parse(response);
};

export const readNotification = async (id: string) => {
	const response = await http.post(e.read(id)).json<unknown>();

	return notificationResponseSchema.parse(response);
};

/** Answers 204. */
export const readAllNotifications = async () => {
	await http.post(e.readAll);
};
