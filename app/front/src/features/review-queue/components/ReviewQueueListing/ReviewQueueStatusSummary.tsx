import { Badge } from "@components/ui/badge";
import type { ReviewQueueItem } from "@services/review-queue";

import { DeadlineStatusBadge } from "./DeadlineStatusBadge";

interface ReviewQueueStatusSummaryProps {
	item: ReviewQueueItem;
}

export const ReviewQueueStatusSummary = ({
	item,
}: ReviewQueueStatusSummaryProps) => (
	<div className="flex flex-wrap items-center gap-1.5">
		<DeadlineStatusBadge deadlineStatus={item.deadlineStatus} />

		{item.reanalysis ? <Badge variant="tag">Reanálise</Badge> : null}
	</div>
);
