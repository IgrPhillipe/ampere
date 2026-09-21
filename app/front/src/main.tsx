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

const enableMocking = async (): Promise<void> => {
	if (!AppConfig.IS_DEV) return;

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
