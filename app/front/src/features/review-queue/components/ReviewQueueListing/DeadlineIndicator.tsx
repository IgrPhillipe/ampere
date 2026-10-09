import { cn } from "@lib/utils";
import type { DeadlineStatus } from "@services/review-queue";
import { CircleAlert } from "lucide-react";

const deadlineActionLabels: Partial<Record<DeadlineStatus, string>> = {
	OVERDUE: "Análise atrasada",
	DUE_TODAY: "Analisar hoje",
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

	if (!label) return null;

	return (
		<span
			title={label}
			className={cn(
				"inline-flex size-6 items-center justify-center rounded-full bg-brand-sunset/20 text-warning-foreground",
				className,
			)}
		>
			<CircleAlert className="size-3.5" aria-hidden="true" />
			<span className="sr-only">{label}</span>
		</span>
	);
};
