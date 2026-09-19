import type { ApiResponse } from "@features/shared";
import { http } from "@lib/http";

import { AuthEndpoints as e } from "./endpoints";
import type { AuthUser, LoginResponse } from "./schemas";
import type { LoginPayload } from "./types";

export const login = (payload: LoginPayload) =>
	http.post(e.login, { json: payload }).json<ApiResponse<LoginResponse>>();

export const getMe = () => http.get(e.me).json<ApiResponse<AuthUser>>();
