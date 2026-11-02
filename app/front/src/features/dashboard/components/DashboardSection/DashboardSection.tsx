import { cn } from "@lib/utils";
import type { ReactNode } from "react";
import { useId } from "react";

interface DashboardSectionProps {
	title: string;
	/** Mono caption on the right of the title. */
	caption?: string;
	children: ReactNode;
	className?: string;
}

export const DashboardSection = ({
	title,
	caption,
	children,
	className,
}: DashboardSectionProps) => {
	const titleId = useId();

	return (
		<section
			aria-labelledby={titleId}
			className={cn("flex flex-col", className)}
		>
			<div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-foreground pb-3">
				<h2 id={titleId} className="text-lg font-semibold">
					{title}
				</h2>
				{caption ? (
					<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
						{caption}
					</span>
				) : null}
			</div>
			{children}
		</section>
	);
};

/** Muted line shown when a section has nothing to list. */
export const DashboardSectionEmpty = ({
	children,
}: {
	children: ReactNode;
}) => <p className="py-4 text-sm text-muted-foreground">{children}</p>;
