import { type ReactNode, useState } from "react";

import { Footer } from "../Footer";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";

interface AppLayoutProps {
	children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div className="flex h-svh overflow-hidden">
			<Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

			<div className="flex flex-1 flex-col overflow-hidden">
				<Header onMenuClick={() => setMobileOpen(true)} />

				<main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>

				<Footer />
			</div>
		</div>
	);
};
