import { useAuthStore } from "@features/shared";
import { cn } from "@lib/utils";
import type { ReactNode } from "react";

import { Eyebrow } from "../Eyebrow";

/** The portal each role sees, shown above the title when the page names none. */
const PORTAL_EYEBROW = {
	user: "Portal do projetista",
	reviewer: "Análise técnica",
	admin: "Administração do portal",
} as const;

interface PageLayoutProps {
	/**
	 * Sem `title`, `description` e `actions` o cabecalho nao e renderizado: a
	 * tela cuida do proprio titulo. E o caso do formulario de novo projeto, que
	 * traz o `h1` dentro do cartao para o passo aparecer acima dele.
	 */
	title?: string;
	/** Versalete line above the title; defaults to the portal of the role. */
	eyebrow?: ReactNode;
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
	eyebrow,
	description,
	actions,
	children,
	className,
	bleed = false,
}: PageLayoutProps) => {
	const role = useAuthStore((state) => state.user?.role);
	const hasHeader = Boolean(title || description || actions);
	const eyebrowText = eyebrow ?? (role ? PORTAL_EYEBROW[role] : null);

	return (
		<div
			className={cn(
				"flex flex-col py-6 md:py-9",
				hasHeader && "gap-8",
				!bleed && "px-4 md:px-10",
				className,
			)}
		>
			{hasHeader ? (
				<div
					className={cn(
						"flex flex-wrap items-start justify-between gap-3",
						bleed && "px-4 md:px-10",
					)}
				>
					<div className="flex flex-col gap-3">
						{title && eyebrowText ? <Eyebrow>{eyebrowText}</Eyebrow> : null}

						{title ? (
							<h1 className="font-heading text-3xl font-medium tracking-[-0.032em]">
								{title}
							</h1>
						) : null}

						{description ? (
							<p className="max-w-2xl text-sm text-muted-foreground">
								{description}
							</p>
						) : null}
					</div>

					{actions ? <div className="flex gap-2">{actions}</div> : null}
				</div>
			) : null}

			{children}
		</div>
	);
};
