import { formatDate } from "@features/shared";
import { cn } from "@lib/utils";

interface DateCellProps {
	/** ISO date or date-time. */
	value: string;
	className?: string;
}

export const DateCell = ({ value, className }: DateCellProps) => (
	<div className={cn("flex flex-col items-center gap-0.5", className)}>
		<time dateTime={value} className="font-mono text-xs text-foreground">
			{formatDate(value)}
		</time>
	</div>
);
