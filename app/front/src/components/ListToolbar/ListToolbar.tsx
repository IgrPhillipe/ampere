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
	/** Quick filter chips or dropdowns, on the line below the search. */
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
			{/* The search takes the whole line, past its own default width. */}
			<div className="w-full *:max-w-none">{search}</div>
			{/* Sort and actions keep the filters' line: the filters wrap, they don't. */}
			{refinements || sort || actions ? (
				<div className="flex flex-wrap items-start gap-x-4 gap-y-3 md:flex-nowrap">
					{refinements ? (
						<div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
							{refinements}
						</div>
					) : null}
					{sort || actions ? (
						<div className="ml-auto flex shrink-0 flex-wrap items-center gap-1.5">
							{sort}
							{actions}
						</div>
					) : null}
				</div>
			) : null}
			{activeFilters}
		</div>
	</div>
);
