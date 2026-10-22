import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ListToolbarProps {
	/** Filter tiles, edge to edge. */
	filters: ReactNode;
	/** Search field. The bar handles the side gutter and the divider. */
	search: ReactNode;
	sort?: ReactNode;
	/** Extra filter controls, under the search. */
	refinements?: ReactNode;
	/** What is filtering the list right now, usually `ActiveFilters`. */
	activeFilters?: ReactNode;
	className?: string;
}

export const ListToolbar = ({
	filters,
	search,
	sort,
	refinements,
	activeFilters,
	className,
}: ListToolbarProps) => (
	<div className={cn("flex flex-col bg-card", className)}>
		{filters}
		<div className="flex flex-col gap-4 border-b border-border px-gutter py-4 md:px-gutter-md">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				{search}
				{sort}
			</div>
			{refinements ? (
				<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
					{refinements}
				</div>
			) : null}
			{activeFilters}
		</div>
	</div>
);
