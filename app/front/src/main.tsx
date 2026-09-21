import { NotFound } from "@components/NotFound";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppConfig } from "@/config";
import { Providers } from "@/providers";

import { routeTree } from "./routeTree.gen";
import "./styles/index.css";

const router = createRouter({ routeTree, defaultNotFoundComponent: NotFound });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

/**
 * Liga os mocks do MSW, quando `VITE_ENABLE_MSW=true`.
 *
 * Desligado por padrao: com o mock sempre ligado em desenvolvimento nao havia
 * como exercitar a API de verdade, e as historias da Entrega 02 precisam ler e
 * escrever no banco. Ligue para mexer no front sem subir o back.
 *
 * A falha e deliberadamente nao-fatal: navegadores sem service worker (ou com
 * ele bloqueado) derrubariam a aplicacao inteira numa tela branca, que e
 * praticamente impossivel de diagnosticar. Sem mock, as chamadas vao para a
 * API real via proxy do Vite.
 */
const enableMocking = async (): Promise<void> => {
	if (!AppConfig.IS_DEV || !AppConfig.ENABLE_MSW) return;

	try {
		const { worker } = await import("@/mocks/browser");

		await worker.start({ onUnhandledRequest: "bypass" });
	} catch (error) {
		console.warn(
			"[MSW] Mocks desativados: nao foi possivel registrar o service worker.",
			error,
		);
	}
};

enableMocking().then(() => {
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<Providers>
				<RouterProvider router={router} />
			</Providers>
		</StrictMode>,
	);
});
