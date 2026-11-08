import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ConclusionFieldProps {
	/** Versalete line on top, naming what the screen answers. */
	label: ReactNode;
	/** The answer itself, in mono 60. */
	value?: ReactNode;
	/** Versalete caption under the value. */
	caption?: ReactNode;
	children?: ReactNode;
	className?: string;
}

/**
 * The single inverted field of each screen, in deep Neoenergia green, carrying
 * the answer that step produced.
 */
export const ConclusionField = ({
	label,
	value,
	caption,
	children,
	className,
}: ConclusionFieldProps) => (
	<section
		className={cn(
			"flex flex-col gap-5 bg-primary px-6 py-6 text-primary-foreground",
			className,
		)}
	>
		<div className="flex flex-col gap-3">
			<p className="border-b-[1.5px] border-primary-foreground/80 pb-3 font-mono text-2xs tracking-[0.11em] uppercase">
				{label}
			</p>

			{value !== undefined ? (
				<p className="font-mono text-6xl leading-none font-medium tracking-[-0.04em]">
					{value}
				</p>
			) : null}

			{caption ? (
				<p className="font-mono text-2xs tracking-[0.11em] uppercase opacity-85">
					{caption}
				</p>
			) : null}
		</div>

		{children}
	</section>
);
