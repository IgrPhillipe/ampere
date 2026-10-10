import { formatDate } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

import { formatDeadlineDistance } from "./review-queue-row";

interface DeadlineCellProps {
	item: ReviewQueueItem;
}

export const DeadlineCell = ({ item }: DeadlineCellProps) => (
	<div className="flex flex-col gap-0.5">
		<time
			dateTime={item.deadline}
			className="font-mono text-xs text-foreground"
		>
			{formatDate(item.deadline)}
		</time>
		<span className="text-xs text-muted-foreground">
			{formatDeadlineDistance(item)}
		</span>
	</div>
);
