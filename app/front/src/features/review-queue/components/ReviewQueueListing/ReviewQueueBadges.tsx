import { Badge } from "@components/ui/badge";
import { padCount } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

const formatDays = (days: number) => `${days} ${days === 1 ? "Dia" : "Dias"}`;

export const WarningBadge = ({
	warnings,
}: Pick<ReviewQueueItem, "warnings">) =>
	warnings > 0 ? (
		<Badge
			variant="warning"
			className="font-mono text-sm font-normal tracking-wider uppercase"
		>
			{padCount(warnings)} {warnings === 1 ? "Alerta" : "Alertas"}
		</Badge>
	) : (
		<span className="font-mono text-sm tracking-wider text-muted-foreground uppercase">
			Sem Alerta
		</span>
	);

export const DeadlineBadge = ({
	deadlineStatus,
	daysRemaining,
}: Pick<ReviewQueueItem, "deadlineStatus" | "daysRemaining">) => {
	if (deadlineStatus === "OVERDUE") {
		return (
			<Badge variant="destructive" className="font-mono text-xs font-normal">
				Atrasado {formatDays(Math.abs(daysRemaining))}
			</Badge>
		);
	}

	if (deadlineStatus === "DUE_TODAY") {
		return (
			<Badge variant="warning" className="font-mono text-xs font-normal">
				Vence Hoje
			</Badge>
		);
	}

	return (
		<Badge variant="success" className="font-mono text-xs font-normal">
			{formatDays(daysRemaining)}
		</Badge>
	);
};

export const ReanalysisBadge = () => <Badge variant="outline">Reanálise</Badge>;
