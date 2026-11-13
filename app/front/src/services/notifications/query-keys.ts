export const notificationKeys = {
	all: () => ["notifications"] as const,
	list: () => [...notificationKeys.all(), "list"] as const,
	read: () => [...notificationKeys.all(), "read"] as const,
	readAll: () => [...notificationKeys.all(), "read-all"] as const,
};
