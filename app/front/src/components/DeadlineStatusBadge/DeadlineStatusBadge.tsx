import { cn } from "@lib/utils";
import type { DeadlineStatus } from "@services/review-queue";

import {
	type DescribeDeadlineOptions,
	describeDeadline,
} from "./describe-deadline";

interface DeadlineStatusBadgeProps extends DescribeDeadlineOptions {
	deadlineStatus: DeadlineStatus;
	daysRemaining: number;
	className?: string;
}

/** Plain mono text, no color: ink when the deadline asks for action, faint otherwise. */
export const DeadlineStatusBadge = ({
	deadlineStatus,
	daysRemaining,
	withRemaining,
	className,
}: DeadlineStatusBadgeProps) => (
	<span
		data-status={deadlineStatus}
		className={cn(
			"font-mono text-2xs tracking-[0.11em] whitespace-nowrap",
			deadlineStatus === "ON_TIME"
				? "text-faint-foreground"
				: "font-medium text-foreground",
			className,
		)}
	>
		{describeDeadline(deadlineStatus, daysRemaining, { withRemaining })}
	</span>
);
