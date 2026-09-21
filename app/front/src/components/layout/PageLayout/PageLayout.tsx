import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface PageLayoutProps {
	title: string;
	description?: ReactNode;
	/** Botoes do canto superior direito (criar, exportar, etc.). */
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	headingClassName?: string;
}

/** Cabecalho padrao de pagina. Usar dentro das rotas sob o `AppShell`. */
export const PageLayout = ({
	title,
	description,
	actions,
	children,
	className,
	headingClassName,
}: PageLayoutProps) => {
	const hasHeader = Boolean(title || description || actions);

	return (
		<div
			className={cn(
				"flex flex-col p-4 md:p-7",
				hasHeader && "gap-7",
				className,
			)}
		>
			{hasHeader ? (
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className={cn("flex flex-col gap-2", headingClassName)}>
						<h1 className="font-heading text-3xl font-semibold tracking-tight">
							{title}
						</h1>

						{description ? (
							<p className="text-sm text-muted-foreground">{description}</p>
						) : null}
					</div>

					{actions ? <div className="flex gap-2">{actions}</div> : null}
				</div>
			) : null}

			{children}
		</div>
	);
};
