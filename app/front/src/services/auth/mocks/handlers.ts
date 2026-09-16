import { HttpResponse, http } from "msw";

import { AuthEndpoints as e } from "../endpoints";
import type { LoginPayload } from "../types";
import {
	MOCK_PASSWORD,
	MOCK_USERS,
	makeLoginResponse,
	makeMe,
} from "./factories";

const url = (path: string) => `/api/${path}`;

const findUser = (email: string) =>
	MOCK_USERS.find((user) => user.email === email.trim().toLowerCase());

export const authHandlers = [
	http.post(url(e.login), async ({ request }) => {
		const { email, password } = (await request.json()) as LoginPayload;
		const user = findUser(email);

		if (!user || password !== MOCK_PASSWORD) {
			// Mesmo formato do ProblemDetail que o Spring Boot devolve,
			// para o caminho de erro ser exercitado de verdade.
			return HttpResponse.json(
				{
					type: "about:blank",
					title: "Unauthorized",
					status: 401,
					detail: "E-mail ou senha invalidos.",
					instance: `/${e.login}`,
				},
				{ status: 401 },
			);
		}

		return HttpResponse.json(makeLoginResponse(user));
	}),

	http.get(url(e.me), ({ request }) => {
		const token = request.headers.get("Authorization")?.replace("Bearer ", "");
		const user = MOCK_USERS.find((it) => `mock-token-${it.id}` === token);

		if (!user) return new HttpResponse(null, { status: 401 });

		return HttpResponse.json(makeMe(user));
	}),
];
