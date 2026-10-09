import type { ReviewQueueItem } from "@services/review-queue";

const formatDays = (days: number) => `${days} ${days === 1 ? "dia" : "dias"}`;

export const formatDeadlineStatus = ({
	deadlineStatus,
	daysRemaining,
}: ReviewQueueItem) => {
	if (deadlineStatus === "OVERDUE")
		return `Atrasado, ${formatDays(Math.abs(daysRemaining))}`;
	if (deadlineStatus === "DUE_TODAY") return "Vence hoje";
	return `No prazo, ${formatDays(daysRemaining)}`;
};

export const formatQueueItemOrigin = ({
	municipality,
	ownerName,
}: ReviewQueueItem) => [municipality, ownerName].filter(Boolean).join(", ");
