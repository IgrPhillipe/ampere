import type { ApiResponse } from "@features/shared";

import type { AuthUser, LoginResponse } from "../schemas";

/**
 * Usuarios de desenvolvimento. Existem so enquanto o back-end Spring Boot
 * nao sobe; nao representam papeis reais do AMPERE (ver Q1c em
 * `docs/produto/questoes-em-aberto.md`).
 */
export const MOCK_PASSWORD = "senha@123";

export const MOCK_USERS: AuthUser[] = [
	{ id: "1", name: "Usuario Teste", email: "user@ampere.local", role: "user" },
	{ id: "2", name: "Admin Teste", email: "admin@ampere.local", role: "admin" },
];

export const makeLoginResponse = (
	user: AuthUser,
): ApiResponse<LoginResponse> => ({
	data: { token: `mock-token-${user.id}`, user },
});

export const makeMe = (user: AuthUser): ApiResponse<AuthUser> => ({
	data: user,
});
