import { useAuthStore } from "@features/shared";
import ky, { isHTTPError } from "ky";

import { AppConfig } from "@/config";

import { type ApiHTTPError, parseSpringErrorBody } from "./api-error";

export const http = ky.create({
	prefix: AppConfig.API_URL,
	timeout: 30_000,
	retry: 0,
	hooks: {
		beforeRequest: [
			({ request }) => {
				const { token } = useAuthStore.getState().user ?? {};

				if (token) request.headers.set("Authorization", `Bearer ${token}`);
			},
		],
		/** Sessao recusada pelo servidor derruba a sessao local. */
		afterResponse: [
			({ request, response }) => {
				if (response.status !== 401) return;
				if (new URL(request.url).pathname.endsWith("/auth/login")) return;

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
