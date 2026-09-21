import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface PageLayoutProps {
	/**
	 * Sem `title`, `description` e `actions` o cabecalho nao e renderizado: a
	 * tela cuida do proprio titulo. E o caso do formulario de novo projeto, que
	 * traz o `h1` dentro do cartao para o passo aparecer acima dele.
	 */
	title?: string;
	description?: ReactNode;
	/** Buttons in the top right corner (create, export, etc.). */
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	bleed?: boolean;
}

/** Standard page header. Use inside the routes under `AppShell`. */
export const PageLayout = ({
	title,
	description,
	actions,
	children,
	className,
	bleed = false,
}: PageLayoutProps) => {
	const hasHeader = Boolean(title || description || actions);

	return (
		<div
			className={cn(
				"flex flex-col py-4 md:py-7",
				hasHeader && "gap-7",
				!bleed && "px-4 md:px-7",
				className,
			)}
		>
			{hasHeader ? (
				<div
					className={cn(
						"flex flex-wrap items-start justify-between gap-3",
						bleed && "px-gutter md:px-gutter-md",
					)}
				>
					<div className="flex flex-col gap-2">
						{title ? (
							<h1 className="font-heading text-3xl font-semibold tracking-tight">
								{title}
							</h1>
						) : null}

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
