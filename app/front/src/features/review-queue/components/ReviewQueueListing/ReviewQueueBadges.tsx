import { Badge } from "@components/ui/badge";
import type { ReviewQueueItem } from "@services/review-queue";

export const WarningBadge = ({
	warnings,
}: Pick<ReviewQueueItem, "warnings">) =>
	warnings > 0 ? (
		<Badge variant="warning">
			{warnings.toString().padStart(2, "0")}{" "}
			{warnings === 1 ? "alerta" : "alertas"}
		</Badge>
	) : (
		<span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
			Sem alerta
		</span>
	);

export const DeadlineBadge = ({
	deadlineStatus,
	daysRemaining,
}: Pick<ReviewQueueItem, "deadlineStatus" | "daysRemaining">) => {
	if (deadlineStatus === "OVERDUE") {
		const days = Math.abs(daysRemaining);
		return (
			<span className="text-sm text-[#1e1a13]">
				Atrasado {days} {days === 1 ? "dia" : "dias"}
			</span>
		);
	}

	if (deadlineStatus === "DUE_TODAY") {
		return <span className="text-sm text-[#1e1a13]">Vence hoje</span>;
	}

	return (
		<span className="text-sm text-[#1e1a13]">
			{daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
		</span>
	);
};
