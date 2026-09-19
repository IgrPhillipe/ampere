import type { ReactNode } from "react";

import { Footer } from "../Footer";
import { Header } from "../Header";

interface AppLayoutProps {
	children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => (
	<div className="flex h-svh flex-col overflow-hidden bg-background">
		<Header />

		<main className="flex-1 overflow-y-auto">{children}</main>

		<Footer />
	</div>
);
