import { AttentionIndicator } from "@components/AttentionIndicator";
import type { ReviewQueueItem } from "@services/review-queue";

import { getQueueItemAttention } from "./review-queue-row";

interface QueueItemIndicatorProps {
	item: ReviewQueueItem;
	className?: string;
}

export const QueueItemIndicator = ({
	item,
	className,
}: QueueItemIndicatorProps) => {
	const message = getQueueItemAttention(item);

	return message ? (
		<AttentionIndicator message={message} className={className} />
	) : null;
};
