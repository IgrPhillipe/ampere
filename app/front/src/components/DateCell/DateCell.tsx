import { formatDate } from "@features/shared";
import { cn } from "@lib/utils";

interface DateCellProps {
	/** ISO date or date-time. */
	value: string;
	className?: string;
}

/** Inline, so the column's text alignment places it. */
export const DateCell = ({ value, className }: DateCellProps) => (
	<time
		dateTime={value}
		className={cn("font-mono text-xs text-foreground", className)}
	>
		{formatDate(value)}
	</time>
);
