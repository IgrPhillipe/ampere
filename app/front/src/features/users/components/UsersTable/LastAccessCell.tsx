import { formatDateTime } from "@features/shared";
import { cn } from "@lib/utils";

interface LastAccessCellProps {
	value: string | null;
	className?: string;
}

export const LastAccessCell = ({ value, className }: LastAccessCellProps) => {
	if (!value) {
		return (
			<span className={cn("text-sm text-muted-foreground", className)}>
				Nunca acessou
			</span>
		);
	}

	const { date, time } = formatDateTime(value);

	return (
		<time
			dateTime={value}
			className={cn("font-mono text-xs text-foreground", className)}
		>
			{date} às {time}
		</time>
	);
};
