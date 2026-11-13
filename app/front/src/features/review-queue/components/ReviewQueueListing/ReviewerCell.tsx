import type { ReviewQueueItem } from "@services/review-queue";

import { UNASSIGNED_REVIEWER_LABEL } from "../../constants";

interface ReviewerCellProps {
	item: ReviewQueueItem;
}

export const ReviewerCell = ({ item }: ReviewerCellProps) =>
	item.reviewerName ? (
		<span className="text-sm whitespace-normal text-foreground">
			{item.reviewerName}
		</span>
	) : (
		<span className="text-sm text-muted-foreground">
			{UNASSIGNED_REVIEWER_LABEL}
		</span>
	);
