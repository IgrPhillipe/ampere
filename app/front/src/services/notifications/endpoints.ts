export const NotificationEndpoints = {
	list: "notifications",
	read: (id: string) => `notifications/${id}/read`,
	readAll: "notifications/read-all",
} as const;
