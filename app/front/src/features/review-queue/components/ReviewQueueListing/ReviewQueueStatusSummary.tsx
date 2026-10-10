import type { ReviewQueueItem } from "@services/review-queue";

import { DeadlineStatusBadge } from "./DeadlineStatusBadge";

interface ReviewQueueStatusSummaryProps {
	item: ReviewQueueItem;
}

export const ReviewQueueStatusSummary = ({
	item,
}: ReviewQueueStatusSummaryProps) => (
	<div className="flex flex-col items-start gap-1.5">
		<DeadlineStatusBadge deadlineStatus={item.deadlineStatus} />

		{item.reanalysis ? (
			<span className="text-xs text-muted-foreground">Reanálise</span>
		) : null}
	</div>
);
