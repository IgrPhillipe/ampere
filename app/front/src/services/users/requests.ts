import { toSearchParams } from "@features/shared";
import { http } from "@lib/http";

import { UserEndpoints as e } from "./endpoints";
import { managedUserListResponseSchema } from "./schemas";
import type { ListUsersParams } from "./types";

export const getUserList = async (params: ListUsersParams = {}) => {
	const response = await http
		.get(e.list, { searchParams: toSearchParams({ ...params }) })
		.json<unknown>();

	return managedUserListResponseSchema.parse(response);
};
