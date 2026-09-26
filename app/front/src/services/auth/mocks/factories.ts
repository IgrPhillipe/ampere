import type { ApiResponse } from "@features/shared";

import type { AuthUser, LoginResponse } from "../schemas";

export const MOCK_PASSWORD = "senha@123";

export const MOCK_USERS: AuthUser[] = [
	{ id: "1", name: "Usuario Teste", email: "user@ampere.com", role: "user" },
	{ id: "2", name: "Admin Teste", email: "admin@ampere.com", role: "admin" },
];

export const makeLoginResponse = (
	user: AuthUser,
): ApiResponse<LoginResponse> => ({
	data: { token: `mock-token-${user.id}`, user },
});

export const makeMe = (user: AuthUser): ApiResponse<AuthUser> => ({
	data: user,
});
