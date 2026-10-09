import { AttentionIndicator } from "@components/AttentionIndicator";
import type { DeadlineStatus } from "@services/review-queue";

const deadlineActionLabels: Partial<Record<DeadlineStatus, string>> = {
	OVERDUE: "Prazo de análise vencido",
	DUE_TODAY: "Prazo de análise vence hoje",
};

interface DeadlineIndicatorProps {
	deadlineStatus: DeadlineStatus;
	className?: string;
}

export const DeadlineIndicator = ({
	deadlineStatus,
	className,
}: DeadlineIndicatorProps) => {
	const label = deadlineActionLabels[deadlineStatus];

	return label ? (
		<AttentionIndicator label={label} className={className} />
	) : null;
};
