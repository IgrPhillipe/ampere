import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface SectionHeadingProps {
	children: ReactNode;
	/** Versalete metadata on the right, such as a count or a period. */
	meta?: ReactNode;
	/** Actions on the right, after the metadata. */
	actions?: ReactNode;
	as?: "h2" | "h3";
	id?: string;
	className?: string;
}

/** Section title of the Figma: 19 Medium over a 1.5px ink rule. */
export const SectionHeading = ({
	children,
	meta,
	actions,
	as: Tag = "h2",
	id,
	className,
}: SectionHeadingProps) => (
	<div
		className={cn(
			"flex items-end justify-between gap-4 border-b-[1.5px] border-foreground pb-3",
			className,
		)}
	>
		<Tag id={id} className="text-lg font-medium tracking-[-0.018em]">
			{children}
		</Tag>

		{meta || actions ? (
			<div className="flex items-center gap-4">
				{meta ? (
					<span className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
						{meta}
					</span>
				) : null}
				{actions}
			</div>
		) : null}
	</div>
);
