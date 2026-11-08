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
		<div className="flex h-svh flex-col overflow-hidden bg-desk">
			<Header />

			<main
				ref={mainRef}
				className="flex-1 overflow-y-auto px-3 pb-8 [scrollbar-gutter:stable] md:px-8"
			>
				{/* The sheet: every screen lives on white paper over the desk. */}
				<div className="mx-auto min-h-full w-full max-w-page border border-border bg-background">
					{children}
				</div>
			</main>
		</div>
	);
};
