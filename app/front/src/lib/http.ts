import { useAuthStore } from "@features/auth/store";
import ky, { isHTTPError } from "ky";

import { AppConfig } from "@/config";

import { type ApiHTTPError, parseSpringErrorBody } from "./api-error";

export const http = ky.create({
	prefix: AppConfig.API_URL,
	timeout: 30_000,
	/**
	 * Quem decide repeticao e o React Query, que e quem a interface observa
	 * por `isError` e `refetch`. Somada a dele, a retentativa do ky levava um
	 * GET com falha a seis tentativas antes de a tela dizer qualquer coisa.
	 */
	retry: 0,
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
