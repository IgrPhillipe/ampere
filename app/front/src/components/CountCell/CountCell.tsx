import { padCount } from "@features/shared";

interface CountCellProps {
	count: number;
}

/** A zero stays blank, so only the rows that have something stand out. */
export const CountCell = ({ count }: CountCellProps) =>
	count > 0 ? (
		<span className="font-mono text-sm font-semibold text-foreground">
			{padCount(count)}
		</span>
	) : null;
