import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { type ReactNode, useId, useState } from "react";

interface ListToolbarProps {
	/** Filter tiles, edge to edge. */
	filters: ReactNode;
	/** Search field. The bar handles the side gutter and the divider. */
	search: ReactNode;
	sort?: ReactNode;
	/** Collapsed behind a "Filtros" button below `sm`. */
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
}: ListToolbarProps) => {
	const refinementsId = useId();
	const [isRefinementsOpen, setRefinementsOpen] = useState(false);

	return (
		<div className={cn("flex flex-col bg-card", className)}>
			{filters}
			<div className="flex flex-col gap-4 border-b border-border px-gutter py-4 md:px-gutter-md">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					{search}
					<div className="flex items-center gap-2">
						{sort}
						{refinements ? (
							<Button
								type="button"
								size="xs"
								variant="neutral"
								aria-expanded={isRefinementsOpen}
								aria-controls={refinementsId}
								onClick={() => setRefinementsOpen((open) => !open)}
								className="gap-2 font-mono font-normal tracking-wider uppercase sm:hidden"
							>
								<SlidersHorizontal aria-hidden="true" />
								Filtros
							</Button>
						) : null}
					</div>
				</div>
				{refinements ? (
					<div
						id={refinementsId}
						className={cn(
							"flex-col gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-end",
							isRefinementsOpen ? "flex" : "hidden",
						)}
					>
						{refinements}
					</div>
				) : null}
				{activeFilters}
			</div>
		</div>
	);
};
