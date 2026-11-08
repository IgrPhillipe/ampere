import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ProjectDetailFooterProps {
	/** What still holds the action back, on the left of the buttons. */
	summary?: ReactNode;
	children?: ReactNode;
	className?: string;
}

export const ProjectDetailFooter = ({
	summary,
	children,
	className,
}: ProjectDetailFooterProps) => (
	<div
		className={cn(
			"flex flex-wrap items-center justify-end gap-x-5 gap-y-3 px-6 py-4 md:px-10",
			className,
		)}
	>
		{summary ? (
			<div className="flex min-w-0 items-center">{summary}</div>
		) : null}

		{children}
	</div>
);
