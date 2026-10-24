import { DateCell } from "@components/DateCell";
import type { ReviewQueueItem } from "@services/review-queue";

interface DeadlineCellProps {
	item: ReviewQueueItem;
}

export const DeadlineCell = ({ item }: DeadlineCellProps) => (
	<DateCell value={item.deadline} />
);
