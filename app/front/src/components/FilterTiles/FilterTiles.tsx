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

/** The screen's conclusion field: a green band of counters that double as filters. */
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
						className="group relative flex min-h-29 flex-col justify-center gap-2 pr-5 pl-10 text-left transition-colors not-last:after:absolute not-last:after:inset-y-6 not-last:after:right-0 not-last:after:w-px not-last:after:bg-primary-foreground/25 hover:bg-primary-foreground/5 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none"
					>
						<span className="font-mono text-[2.125rem] leading-none font-medium tracking-[-0.03em]">
							{padCount(tile.count)}
						</span>
						<span className="font-mono text-2xs tracking-[0.11em] uppercase opacity-85">
							{tile.label}
						</span>
						<span
							className="absolute right-6 bottom-5 left-10 h-0.5 bg-primary-foreground opacity-0 transition-opacity group-hover:opacity-50 data-active:opacity-100"
							data-active={isActive || undefined}
						/>
					</button>
				);
			})}

			{stats.map((stat, index) => (
				<div
					key={stat.label}
					className={cn(
						"relative flex min-h-29 flex-col justify-center gap-2 pr-5 pl-10 not-last:after:absolute not-last:after:inset-y-6 not-last:after:right-0 not-last:after:w-px not-last:after:bg-primary-foreground/25",
						index === 0 && "border-l border-l-primary-foreground/40",
					)}
				>
					<span className="font-mono text-[2.125rem] leading-none font-medium tracking-[-0.03em]">
						{stat.value ?? (
							<Skeleton className="h-10 w-16 bg-primary-foreground/25" />
						)}
					</span>
					<span className="font-mono text-2xs tracking-[0.11em] uppercase opacity-85">
						{stat.label}
					</span>
				</div>
			))}
		</div>
	</div>
);
