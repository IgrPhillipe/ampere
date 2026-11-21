import {
	DeadlineStatusBadge,
	formatDays,
} from "@components/DeadlineStatusBadge";
import type { ReviewQueueItem } from "@services/review-queue";

interface DeadlineCellProps {
	item: ReviewQueueItem;
}

export const DeadlineCell = ({ item }: DeadlineCellProps) => (
	<div className="flex flex-col items-end gap-1">
		<DeadlineStatusBadge
			deadlineStatus={item.deadlineStatus}
			daysRemaining={item.daysRemaining}
			withRemaining
		/>
		<span className="font-mono text-2xs whitespace-nowrap text-muted-foreground">
			{formatDays(item.elapsedDays)} corridos
		</span>
		<span className="font-mono text-2xs whitespace-nowrap text-muted-foreground">
			{formatDays(item.suspendedDays)} suspensos
		</span>
	</div>
);
