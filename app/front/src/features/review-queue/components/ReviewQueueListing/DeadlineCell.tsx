import {
	DeadlineStatusBadge,
	formatDays,
} from "@components/DeadlineStatusBadge";
import type { ReviewQueueItem } from "@services/review-queue";

interface DeadlineCellProps {
	item: ReviewQueueItem;
}

// A decided project has no running clock to show.
export const DeadlineCell = ({ item }: DeadlineCellProps) =>
	item.deadlineStatus && item.daysRemaining !== null ? (
		<div className="flex flex-col items-end gap-1">
			<DeadlineStatusBadge
				deadlineStatus={item.deadlineStatus}
				daysRemaining={item.daysRemaining}
				withRemaining
			/>
			{item.elapsedDays !== null ? (
				<span className="font-mono text-2xs whitespace-nowrap text-muted-foreground">
					{formatDays(item.elapsedDays)} corridos
				</span>
			) : null}
			{item.suspendedDays !== null ? (
				<span className="font-mono text-2xs whitespace-nowrap text-muted-foreground">
					{formatDays(item.suspendedDays)} suspensos
				</span>
			) : null}
		</div>
	) : null;
