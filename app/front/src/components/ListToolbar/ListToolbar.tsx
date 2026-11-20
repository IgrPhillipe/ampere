import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ListToolbarProps {
	/** Filter tiles, edge to edge. */
	filters: ReactNode;
	/** Search field. The bar handles the side gutter and the divider. */
	search: ReactNode;
	sort?: ReactNode;
	/** List-wide actions, such as an export, next to the sort. */
	actions?: ReactNode;
	/** Quick filter chips or dropdowns, on the search line while they fit. */
	refinements?: ReactNode;
	activeFilters?: ReactNode;
	className?: string;
}

export const ListToolbar = ({
	filters,
	search,
	sort,
	actions,
	refinements,
	activeFilters,
	className,
}: ListToolbarProps) => (
	<div className={cn("flex flex-col bg-card", className)}>
		{filters}
		<div className="flex flex-col gap-3 border-b border-border px-gutter py-5 md:px-gutter-md">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-3">
				<div className="w-full md:w-72 md:shrink-0">{search}</div>
				{refinements ? (
					<div className="flex flex-wrap items-center gap-1.5">
						{refinements}
					</div>
				) : null}
				{sort || actions ? (
					<div className="flex flex-wrap items-center gap-1.5 md:ml-auto">
						{sort}
						{actions}
					</div>
				) : null}
			</div>
			{activeFilters}
		</div>
	</div>
);
