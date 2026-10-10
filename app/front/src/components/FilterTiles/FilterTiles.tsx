import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";

export interface FilterTile<T> {
	value: T;
	label: string;
	count: number;
}

/** A counter that does not filter the list, shown after the filters. */
export interface StatTile {
	label: string;
	value?: string;
}

interface FilterTilesProps<T> {
	tiles: FilterTile<T>[];
	stats?: StatTile[];
	value: T;
	onValueChange: (value: T) => void;
	label: string;
	className?: string;
}

/** Green band of counters that double as filters, edge to edge. */
export const FilterTiles = <T,>({
	tiles,
	stats = [],
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

			{stats.map((stat, index) => (
				<div
					key={stat.label}
					className={cn(
						"flex min-h-30 flex-col justify-center gap-2 border-r border-primary-foreground/20 pr-5 pl-gutter last:border-r-0 md:pl-gutter-md",
						index === 0 && "border-l-2 border-l-primary-foreground/40",
					)}
				>
					<span className="font-mono text-4xl font-semibold">
						{stat.value ?? (
							<Skeleton className="h-10 w-16 bg-primary-foreground/25" />
						)}
					</span>
					<span className="font-mono text-xs tracking-wider uppercase opacity-80">
						{stat.label}
					</span>
				</div>
			))}
		</div>
	</div>
);
