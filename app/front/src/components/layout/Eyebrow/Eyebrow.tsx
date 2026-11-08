import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface EyebrowProps {
	children: ReactNode;
	className?: string;
}

/** Mono small caps line that names the context above a title. */
export const Eyebrow = ({ children, className }: EyebrowProps) => (
	<p
		className={cn(
			"font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase",
			className,
		)}
	>
		{children}
	</p>
);
