import { formatDate } from "@features/shared";
import { cn } from "@lib/utils";

interface DateCellProps {
	/** ISO date or date-time. */
	value: string;
	/** Second line under the date, such as "há 7 dias". */
	caption?: string;
	className?: string;
}

export const DateCell = ({ value, caption, className }: DateCellProps) => (
	<div className={cn("flex flex-col items-center gap-0.5", className)}>
		<time dateTime={value} className="font-mono text-xs text-foreground">
			{formatDate(value)}
		</time>
		{caption ? (
			<span className="text-xs whitespace-normal text-muted-foreground">
				{caption}
			</span>
		) : null}
	</div>
);
