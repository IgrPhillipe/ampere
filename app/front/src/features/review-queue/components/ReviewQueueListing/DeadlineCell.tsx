import { DateCell } from "@components/DateCell";
import type { ReviewQueueItem } from "@services/review-queue";

import { formatDeadlineDistance } from "./review-queue-row";

interface DeadlineCellProps {
	item: ReviewQueueItem;
}

export const DeadlineCell = ({ item }: DeadlineCellProps) => (
	<DateCell value={item.deadline} caption={formatDeadlineDistance(item)} />
);
