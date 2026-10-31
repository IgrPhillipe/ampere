import { useAuthStore } from "@features/shared";
import ky, { isHTTPError } from "ky";

import { AppConfig } from "@/config";

import { type ApiHTTPError, parseSpringErrorBody } from "./api-error";

const isLogin = (request: Request) =>
	new URL(request.url).pathname.endsWith("/auth/login");

/** The API refuses a temporary password everywhere but its own change. */
const requiresPasswordChange = async (response: Response) => {
	if (response.status !== 403) return false;

	const body: unknown = await response
		.clone()
		.json()
		.catch(() => null);

	return (
		typeof body === "object" &&
		body !== null &&
		"code" in body &&
		body.code === "PASSWORD_CHANGE_REQUIRED"
	);
};

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
		/** A refused session tears down the local one; a temporary password opens its change. */
		afterResponse: [
			async ({ request, response }) => {
				if (isLogin(request)) return;

				if (response.status === 401) {
					useAuthStore.getState().logout();
					return;
				}

				if (await requiresPasswordChange(response)) {
					useAuthStore.getState().updateUser({ mustChangePassword: true });
				}
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
