import { Separator } from "@components/ui/separator";
import { cn } from "@lib/utils";
import type { ReactNode } from "react";

interface ListToolbarProps {
	/** Filter tiles, edge to edge. */
	filters: ReactNode;
	/** Search field. The bar handles the side gutter and the divider. */
	search: ReactNode;
	sort?: ReactNode;
	refinements?: ReactNode;
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
			{search}
			{refinements || sort ? (
				<div className="flex flex-wrap items-center gap-2">
					{refinements}
					{refinements && sort ? (
						<Separator
							orientation="vertical"
							className="mx-1 hidden self-center data-[orientation=vertical]:h-6 sm:block"
						/>
					) : null}
					{sort}
				</div>
			) : null}
			{activeFilters}
		</div>
	</div>
);
