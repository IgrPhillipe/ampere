import type { ReviewQueueItem } from "@services/review-queue";

export const formatQueueItemOrigin = ({
	municipality,
	ownerName,
}: ReviewQueueItem) => [municipality, ownerName].filter(Boolean).join(", ");
