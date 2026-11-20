import { DeadlineStatusBadge } from "@components/DeadlineStatusBadge";
import type { ReviewQueueItem } from "@services/review-queue";

interface DeadlineCellProps {
	item: ReviewQueueItem;
}

export const DeadlineCell = ({ item }: DeadlineCellProps) => (
	<div className="flex flex-col items-start gap-1">
		<DeadlineStatusBadge
			deadlineStatus={item.deadlineStatus}
			daysRemaining={item.daysRemaining}
			withRemaining
		/>
		<span className="font-mono text-2xs text-muted-foreground">
			{item.elapsedDays} {item.elapsedDays === 1 ? "dia" : "dias"} corridos ·{" "}
			{item.suspendedDays} {item.suspendedDays === 1 ? "dia" : "dias"} suspensos
		</span>
	</div>
);
