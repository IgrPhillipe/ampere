import { padCount } from "@features/shared";
import { cn } from "@lib/utils";

export interface FilterChip<T> {
	value: T;
	label: string;
	count?: number;
}

interface FilterChipsProps<T> {
	chips: readonly FilterChip<T>[];
	value: T;
	onValueChange: (value: T) => void;
	/** Group name for screen readers. */
	label: string;
	className?: string;
}

/** Quick filters of the Figma: the selected chip in ink, the others outlined. */
export const FilterChips = <T,>({
	chips,
	value,
	onValueChange,
	label,
	className,
}: FilterChipsProps<T>) => (
	<div
		role="group"
		aria-label={label}
		className={cn("flex flex-wrap items-center gap-1.5", className)}
	>
		{chips.map((chip) => (
			<button
				key={chip.label}
				type="button"
				aria-pressed={chip.value === value}
				onClick={() => onValueChange(chip.value)}
				className="inline-flex h-8 items-center gap-2 border border-border px-3 font-mono text-2xs tracking-[0.11em] whitespace-nowrap text-foreground uppercase transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
			>
				{chip.label}
				{chip.count === undefined ? null : (
					<span className="tabular-nums">{padCount(chip.count)}</span>
				)}
			</button>
		))}
	</div>
);
