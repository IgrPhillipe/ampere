import type { ListUsersParams } from "./types";

export const userKeys = {
	all: () => ["users"] as const,
	lists: () => [...userKeys.all(), "list"] as const,
	list: (params: ListUsersParams = {}) =>
		[...userKeys.lists(), params] as const,
};
