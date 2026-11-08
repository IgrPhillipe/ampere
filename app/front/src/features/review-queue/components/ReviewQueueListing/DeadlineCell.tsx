import { DeadlineStatusBadge } from "@components/DeadlineStatusBadge";
import type { ReviewQueueItem } from "@services/review-queue";

interface DeadlineCellProps {
	item: ReviewQueueItem;
}

export const DeadlineCell = ({ item }: DeadlineCellProps) => (
	<DeadlineStatusBadge
		deadlineStatus={item.deadlineStatus}
		daysRemaining={item.daysRemaining}
	/>
);
