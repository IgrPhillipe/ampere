import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface PageLayoutProps {
	title: string;
	description?: ReactNode;
	/** Botoes do canto superior direito (criar, exportar, etc.). */
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
}

/** Cabecalho padrao de pagina. Usar dentro das rotas sob o `AppShell`. */
export const PageLayout = ({
	title,
	description,
	actions,
	children,
	className,
}: PageLayoutProps) => (
	<div className={cn("flex flex-col gap-6 p-4 md:p-6", className)}>
		<div className="flex flex-wrap items-start justify-between gap-3">
			<div className="flex flex-col gap-1">
				<h1 className="font-heading text-2xl font-semibold tracking-tight">
					{title}
				</h1>

				{description ? (
					<p className="text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>

			{actions ? <div className="flex gap-2">{actions}</div> : null}
		</div>

		{children}
	</div>
);
