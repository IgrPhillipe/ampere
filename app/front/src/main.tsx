import { Providers } from "@/providers";
import { NotFound } from "@components/NotFound";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { routeTree } from "./routeTree.gen";
import "./styles/index.css";

const router = createRouter({ routeTree, defaultNotFoundComponent: NotFound });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const enableMocking = async (): Promise<void> => {
	if (!import.meta.env.DEV) return;

	const { worker } = await import("@/mocks/browser");

	await worker.start({ onUnhandledRequest: "bypass" });
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
