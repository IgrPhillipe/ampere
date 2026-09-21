import { apiResponseSchema } from "@features/shared";
import { http } from "@lib/http";

import { AuthEndpoints as e } from "./endpoints";
import { authUserSchema, loginResponseSchema } from "./schemas";
import type { LoginPayload } from "./types";

const loginEnvelopeSchema = apiResponseSchema(loginResponseSchema);
const meEnvelopeSchema = apiResponseSchema(authUserSchema);

export const login = async (payload: LoginPayload) => {
	const response = await http.post(e.login, { json: payload }).json<unknown>();

	return loginEnvelopeSchema.parse(response);
};

export const getMe = async () => {
	const response = await http.get(e.me).json<unknown>();

	return meEnvelopeSchema.parse(response);
};
