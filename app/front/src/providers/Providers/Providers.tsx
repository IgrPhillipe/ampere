import type { ReactNode } from "react";

import { QueryProvider } from "../QueryProvider";
import { ThemeProvider } from "../ThemeProvider";

interface ProvidersProps {
	children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
	<ThemeProvider>
		<QueryProvider>{children}</QueryProvider>
	</ThemeProvider>
);
