import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ProjectToolbarProps {
	/** Chips de situação, de ponta a ponta. */
	filters: ReactNode;
	/** Campo de busca. A barra cuida do recuo lateral e da divisória. */
	search: ReactNode;
	className?: string;
}

/**
 * Barra de filtros da listagem. Recebe os dois blocos como slots em vez de
 * repassar as props deles: como container de pass-through eram cinco props
 * entrando e as mesmas cinco saindo, e a pagina nao mostrava o que montava.
 * Mesmo desenho do `PageLayout` e do `EmptyState`.
 */
export const ProjectToolbar = ({
	filters,
	search,
	className,
}: ProjectToolbarProps) => (
	<div className={cn("flex flex-col bg-card", className)}>
		{filters}
		<div className="border-b border-border px-gutter py-4 md:px-gutter-md">
			{search}
		</div>
	</div>
);
