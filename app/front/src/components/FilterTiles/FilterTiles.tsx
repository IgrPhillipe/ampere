import { padCount } from "@features/shared";
import { cn } from "@lib/utils";

export interface FilterTile<T> {
	value: T;
	label: string;
	count: number;
}

interface FilterTilesProps<T> {
	tiles: FilterTile<T>[];
	value: T;
	onValueChange: (value: T) => void;
	label: string;
	className?: string;
}

/** Green band of counters that double as filters, edge to edge. */
export const FilterTiles = <T,>({
	tiles,
	value,
	onValueChange,
	label,
	className,
}: FilterTilesProps<T>) => (
	<div
		role="group"
		aria-label={label}
		className={cn(
			"overflow-x-auto bg-primary text-primary-foreground",
			className,
		)}
	>
		<div className="grid auto-cols-[minmax(10rem,1fr)] grid-flow-col">
			{tiles.map((tile) => {
				const isActive = value === tile.value;

				return (
					<button
						key={tile.label}
						type="button"
						aria-pressed={isActive}
						onClick={() => onValueChange(tile.value)}
						className="group relative flex min-h-30 flex-col justify-center gap-2 border-r border-primary-foreground/20 pr-5 pl-gutter text-left transition-colors last:border-r-0 hover:bg-primary-foreground/10 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none aria-pressed:bg-secondary md:pl-gutter-md"
					>
						<span className="font-mono text-4xl font-semibold">
							{padCount(tile.count)}
						</span>
						<span className="font-mono text-xs tracking-wider uppercase opacity-80">
							{tile.label}
						</span>
						<span
							className="absolute inset-x-4 bottom-4 h-0.5 bg-primary-foreground opacity-0 transition-opacity group-hover:opacity-70 data-active:opacity-100"
							data-active={isActive || undefined}
						/>
					</button>
				);
			})}
		</div>
	</div>
);
