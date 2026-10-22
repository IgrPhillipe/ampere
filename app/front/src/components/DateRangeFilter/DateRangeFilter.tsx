import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";

interface DateRangeFilterProps {
	label: string;
	/** `YYYY-MM-DD`, or `null` for an open start. */
	from: string | null;
	/** `YYYY-MM-DD`, or `null` for an open end. */
	to: string | null;
	onFromChange: (value: string | null) => void;
	onToChange: (value: string | null) => void;
	className?: string;
}

export const DateRangeFilter = ({
	label,
	from,
	to,
	onFromChange,
	onToChange,
	className,
}: DateRangeFilterProps) => (
	<fieldset className={cn("min-w-0", className)}>
		<legend className="mb-1.5 text-xs font-medium text-muted-foreground">
			{label}
		</legend>
		<div className="flex items-center gap-2">
			<Input
				type="date"
				aria-label="Data inicial"
				value={from ?? ""}
				max={to ?? undefined}
				onChange={(event) => onFromChange(event.target.value || null)}
				className="sm:w-40"
			/>
			<span className="text-sm text-muted-foreground">até</span>
			<Input
				type="date"
				aria-label="Data final"
				value={to ?? ""}
				min={from ?? undefined}
				onChange={(event) => onToChange(event.target.value || null)}
				className="sm:w-40"
			/>
		</div>
	</fieldset>
);
