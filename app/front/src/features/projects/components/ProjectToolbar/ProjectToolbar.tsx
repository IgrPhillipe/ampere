import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ProjectToolbarProps {
	/** Status chips, edge to edge. */
	filters: ReactNode;
	/** Search field. The bar handles the side gutter and the divider. */
	search: ReactNode;
	className?: string;
}

/** Filter bar of the listing. */
export const ProjectToolbar = ({
	filters,
	search,
	className,
}: ProjectToolbarProps) => (
	<div className={cn("flex flex-col bg-card", className)}>
		{filters}
		<div className="border-b border-border px-gutter py-4 md:px-gutter-md">
			{search}
		</div>
	</div>
);
