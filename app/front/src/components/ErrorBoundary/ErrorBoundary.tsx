import { Button } from "@components/ui/button";
import type { ReactNode } from "react";
import {
	type FallbackProps,
	ErrorBoundary as ReactErrorBoundary,
} from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
	<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
		<div className="flex flex-col items-center gap-2 text-center">
			<h2 className="text-xl font-semibold text-foreground">Algo deu errado</h2>
			<p className="max-w-md text-sm text-muted-foreground">
				{error instanceof Error ? error.message : "Erro desconhecido"}
			</p>
		</div>

		<Button onClick={resetErrorBoundary}>Tentar novamente</Button>
	</div>
);

interface ErrorBoundaryProps {
	children: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => (
	<ReactErrorBoundary FallbackComponent={ErrorFallback}>
		{children}
	</ReactErrorBoundary>
);
