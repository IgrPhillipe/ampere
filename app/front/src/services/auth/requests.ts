import { apiResponseSchema } from "@features/shared";
import { http } from "@lib/http";

import { AuthEndpoints as e } from "./endpoints";
import { authUserSchema, loginResponseSchema } from "./schemas";
import type { LoginPayload } from "./types";

const loginEnvelopeSchema = apiResponseSchema(loginResponseSchema);
const meEnvelopeSchema = apiResponseSchema(authUserSchema);

/**
 * `.parse()` e nao `.json<T>()`: a versao com generico e promessa de tipo, nao
 * verificacao. Se o back mudar a forma do login, o TypeScript continua
 * satisfeito e a falha aparece longe dali, como `undefined` no meio de um
 * componente — que e o modo de falha que o Zod existe para evitar.
 */
export const login = async (payload: LoginPayload) => {
	const response = await http.post(e.login, { json: payload }).json<unknown>();

	return loginEnvelopeSchema.parse(response);
};

export const getMe = async () => {
	const response = await http.get(e.me).json<unknown>();

	return meEnvelopeSchema.parse(response);
};
