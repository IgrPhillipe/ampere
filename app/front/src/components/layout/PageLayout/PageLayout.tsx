import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface PageLayoutProps {
	title: string;
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
}: PageLayoutProps) => (
	<div
		className={cn(
			"flex flex-col gap-7 py-4 md:py-7",
			!bleed && "px-4 md:px-7",
			className,
		)}
	>
		<div
			className={cn(
				"flex flex-wrap items-start justify-between gap-3",
				bleed && "px-gutter md:px-gutter-md",
			)}
		>
			<div className="flex flex-col gap-2">
				<h1 className="font-heading text-3xl font-semibold tracking-tight">
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
