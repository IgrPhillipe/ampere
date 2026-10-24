import type { ApiResponse } from "@features/shared";

import type { AuthUser, LoginResponse } from "../schemas";

export const MOCK_PASSWORD = "senha@123";

export const MOCK_USERS: AuthUser[] = [
	{
		id: "1",
		name: "Usuario Teste",
		email: "user@ampere.com",
		role: "user",
		mustChangePassword: false,
	},
	{
		id: "2",
		name: "Admin Teste",
		email: "admin@ampere.com",
		role: "admin",
		mustChangePassword: false,
	},
	{
		id: "3",
		name: "Revisor Teste",
		email: "revisor@ampere.com",
		role: "reviewer",
		mustChangePassword: false,
	},
];

export const makeLoginResponse = (
	user: AuthUser,
): ApiResponse<LoginResponse> => ({
	data: { token: `mock-token-${user.id}`, user },
});

export const makeMe = (user: AuthUser): ApiResponse<AuthUser> => ({
	data: user,
});
