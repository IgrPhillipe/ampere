import { useAuthStore } from "@features/shared";
import ky, { isHTTPError } from "ky";

import { AppConfig } from "@/config";

import { type ApiHTTPError, parseSpringErrorBody } from "./api-error";

const isLogin = (request: Request) =>
	new URL(request.url).pathname.endsWith("/auth/login");

export const http = ky.create({
	prefix: AppConfig.API_URL,
	timeout: 30_000,
	retry: 0,
	hooks: {
		beforeRequest: [
			({ request }) => {
				const { token } = useAuthStore.getState().user ?? {};

				// The server refuses a stale token even on the login.
				if (token && !isLogin(request)) {
					request.headers.set("Authorization", `Bearer ${token}`);
				}
			},
		],
		/** A session the server refuses tears down the local session. */
		afterResponse: [
			({ request, response }) => {
				if (response.status !== 401) return;
				if (isLogin(request)) return;

				useAuthStore.getState().logout();
			},
		],
		beforeError: [
			({ error }) => {
				if (!isHTTPError(error)) return error;
				if (error.data == null || typeof error.data !== "object") return error;

				const detail = parseSpringErrorBody(
					error.data as Parameters<typeof parseSpringErrorBody>[0],
				);

				if (detail) {
					(error as ApiHTTPError).apiDetail = detail;
					error.message = detail;
				}

				return error;
			},
		],
	},
});

/** Public third-party APIs (ViaCEP, IBGE): no prefix, no session token. */
export const externalHttp = ky.create({ timeout: 10_000, retry: 1 });
