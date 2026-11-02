import { Badge, type BadgeProps } from "@components/ui/badge";
import type { DeadlineStatus } from "@services/review-queue";

const deadlineStatusLabels = {
	OVERDUE: "Atrasado",
	DUE_TODAY: "Vence Hoje",
	ON_TIME: "No Prazo",
} as const satisfies Record<DeadlineStatus, string>;

const deadlineStatusVariants = {
	OVERDUE: "destructive",
	DUE_TODAY: "warning",
	ON_TIME: "neutral",
} as const satisfies Record<DeadlineStatus, BadgeProps["variant"]>;

interface DeadlineStatusBadgeProps {
	deadlineStatus: DeadlineStatus;
	className?: string;
}

export const DeadlineStatusBadge = ({
	deadlineStatus,
	className,
}: DeadlineStatusBadgeProps) => (
	<Badge variant={deadlineStatusVariants[deadlineStatus]} className={className}>
		{deadlineStatusLabels[deadlineStatus]}
	</Badge>
);
