import type { ReviewQueueItem } from "@services/review-queue";

import { AnalyzeButton } from "./AnalyzeButton";
import { formatDeadlineStatus } from "./review-queue-row";

interface ReviewQueueStatusSummaryProps {
	item: ReviewQueueItem;
}

export const ReviewQueueStatusSummary = ({
	item,
}: ReviewQueueStatusSummaryProps) => (
	<div className="flex flex-col items-start gap-1.5">
		<span className="font-mono text-xs tracking-[0.08em] text-balance text-foreground uppercase">
			{formatDeadlineStatus(item)}
		</span>

		{item.reanalysis ? (
			<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
				Reanálise
			</span>
		) : null}

		<AnalyzeButton />
	</div>
);
