import { useAuthStore } from "@features/shared";
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
		/**
		 * Sessao recusada pelo servidor derruba a sessao local.
		 *
		 * Sem isto o token expirado fica guardado: a guard de rota le o store,
		 * ve `isAuthenticated: true` e deixa passar, entao a pessoa fica numa
		 * tela que so sabe mostrar erro, com um aviso para entrar de novo e sem
		 * caminho para fazer isso.
		 *
		 * O 401 do proprio login e a excecao: ali quem errou foi a credencial, e
		 * a tela de login ja trata a mensagem.
		 */
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
