import { useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef } from "react";

import { Header } from "../Header";

interface AppLayoutProps {
	children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
	const mainRef = useRef<HTMLElement>(null);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	// The router only resets the window, and the page scrolls inside <main>.
	useEffect(() => {
		mainRef.current?.scrollTo({ top: 0 });
	}, [pathname]);

	return (
		<div className="flex h-svh flex-col overflow-hidden bg-background">
			<Header />

			<main
				ref={mainRef}
				className="flex-1 overflow-y-auto [scrollbar-gutter:stable]"
			>
				{children}
			</main>
		</div>
	);
};
