import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";

/** `YYYY-MM-DD` on both ends; `null` leaves that end open. */
export interface DateRange {
	from: string | null;
	to: string | null;
}

interface DateRangeFilterProps {
	label: string;
	value: DateRange;
	onValueChange: (value: DateRange) => void;
	className?: string;
}

export const DateRangeFilter = ({
	label,
	value,
	onValueChange,
	className,
}: DateRangeFilterProps) => {
	const changeFrom = (from: string | null) =>
		onValueChange({
			from,
			to: from && value.to && value.to < from ? null : value.to,
		});

	const changeTo = (to: string | null) =>
		onValueChange({
			from: to && value.from && to < value.from ? null : value.from,
			to,
		});

	return (
		<fieldset className={cn("min-w-0", className)}>
			<legend className="mb-1.5 text-xs font-medium text-muted-foreground">
				{label}
			</legend>
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<Input
					type="date"
					aria-label="Data inicial"
					value={value.from ?? ""}
					max={value.to ?? undefined}
					onChange={(event) => changeFrom(event.target.value || null)}
					className="sm:w-40"
				/>
				<span className="hidden text-sm text-muted-foreground sm:inline">
					até
				</span>
				<Input
					type="date"
					aria-label="Data final"
					value={value.to ?? ""}
					min={value.from ?? undefined}
					onChange={(event) => changeTo(event.target.value || null)}
					className="sm:w-40"
				/>
			</div>
		</fieldset>
	);
};
