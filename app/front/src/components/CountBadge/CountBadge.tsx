import { Badge, type BadgeProps } from "@components/ui/badge";
import { padCount } from "@features/shared";

interface CountBadgeProps {
	count: number;
	singular: string;
	plural: string;
	/** Text shown, without a badge, when the count is zero. */
	empty: string;
	variant: BadgeProps["variant"];
}

export const CountBadge = ({
	count,
	singular,
	plural,
	empty,
	variant,
}: CountBadgeProps) =>
	count > 0 ? (
		<Badge variant={variant}>
			{padCount(count)} {count === 1 ? singular : plural}
		</Badge>
	) : (
		<span className="text-sm text-muted-foreground">{empty}</span>
	);
