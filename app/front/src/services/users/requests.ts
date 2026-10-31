import { apiResponseSchema, toSearchParams } from "@features/shared";
import { http } from "@lib/http";

import { UserEndpoints as e } from "./endpoints";
import {
	managedUserListResponseSchema,
	profileResponseSchema,
} from "./schemas";
import type {
	ChangePasswordRequestPayload,
	ListUsersParams,
	ProfileRequestPayload,
} from "./types";

const profileEnvelopeSchema = apiResponseSchema(profileResponseSchema);

export const getUserList = async (params: ListUsersParams = {}) => {
	const response = await http
		.get(e.list, { searchParams: toSearchParams({ ...params }) })
		.json<unknown>();

	return managedUserListResponseSchema.parse(response);
};

export const getProfile = async () => {
	const response = await http.get(e.profile).json<unknown>();
	return profileEnvelopeSchema.parse(response);
};

export const updateProfile = async (payload: ProfileRequestPayload) => {
	const response = await http.put(e.profile, { json: payload }).json<unknown>();
	return profileEnvelopeSchema.parse(response);
};

export const changePassword = async (payload: ChangePasswordRequestPayload) => {
	await http.put(e.changePassword, { json: payload });
};
