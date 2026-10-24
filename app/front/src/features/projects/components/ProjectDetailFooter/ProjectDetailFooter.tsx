import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ProjectDetailFooterProps {
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
			"flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 md:px-8",
			className,
		)}
	>
		{summary ? (
			<div className="flex shrink-0 items-center gap-4">{summary}</div>
		) : (
			<span aria-hidden="true" />
		)}

		{children}
	</div>
);
