import { ErrorBoundary } from "@components/ErrorBoundary";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { QueryProvider } from "../QueryProvider";
import { ThemeProvider } from "../ThemeProvider";

interface ProvidersProps {
	children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
	<ErrorBoundary>
		<ThemeProvider>
			<QueryProvider>
				{children}

				<Toaster richColors closeButton position="top-right" />
			</QueryProvider>
		</ThemeProvider>
	</ErrorBoundary>
);
