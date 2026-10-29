import { apiResponseSchema } from "@features/shared";
import { http } from "@lib/http";

import { UserEndpoints as e } from "./endpoints";
import { profileResponseSchema } from "./schemas";
import type {
	ChangePasswordRequestPayload,
	ProfileRequestPayload,
} from "./types";

const profileEnvelopeSchema = apiResponseSchema(profileResponseSchema);

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
