import { useAuthStore } from "@features/auth/store";
import ky, { isHTTPError } from "ky";

import { AppConfig } from "@/config";

import { type ApiHTTPError, parseSpringErrorBody } from "./api-error";

export const http = ky.create({
	prefix: AppConfig.API_URL,
	timeout: 30_000,
	retry: { limit: 2, methods: ["get"] },
	hooks: {
		beforeRequest: [
			({ request }) => {
				const { token } = useAuthStore.getState().user ?? {};

				if (token) request.headers.set("Authorization", `Bearer ${token}`);
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
