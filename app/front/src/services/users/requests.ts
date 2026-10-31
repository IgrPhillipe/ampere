import { apiResponseSchema, toSearchParams } from "@features/shared";
import { http } from "@lib/http";

import { UserEndpoints as e } from "./endpoints";
import {
	managedUserListResponseSchema,
	managedUserResponseSchema,
	profileResponseSchema,
	temporaryAccessResponseSchema,
} from "./schemas";
import type {
	ChangePasswordRequestPayload,
	CreateUserPayload,
	ListUsersParams,
	ProfileRequestPayload,
	UpdateUserPayload,
} from "./types";

const profileEnvelopeSchema = apiResponseSchema(profileResponseSchema);

export const getUserList = async (params: ListUsersParams = {}) => {
	const response = await http
		.get(e.list, { searchParams: toSearchParams({ ...params }) })
		.json<unknown>();

	return managedUserListResponseSchema.parse(response);
};

export const createUser = async (payload: CreateUserPayload) => {
	const response = await http.post(e.list, { json: payload }).json<unknown>();

	return temporaryAccessResponseSchema.parse(response);
};

export interface UpdateUserParams {
	id: string;
	payload: UpdateUserPayload;
}

export const updateUser = async ({ id, payload }: UpdateUserParams) => {
	const response = await http
		.put(e.detail(id), { json: payload })
		.json<unknown>();

	return managedUserResponseSchema.parse(response);
};

export const resetUserPassword = async (id: string) => {
	const response = await http.post(e.passwordReset(id)).json<unknown>();

	return temporaryAccessResponseSchema.parse(response);
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
