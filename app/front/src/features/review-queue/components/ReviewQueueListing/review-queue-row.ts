import type { TooltipMessage } from "@components/ui/tooltip";
import { formatDate } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

const formatDays = (days: number) => `${days} ${days === 1 ? "dia" : "dias"}`;

const formatWarnings = (warnings: number) =>
	`${warnings} ${warnings === 1 ? "alerta" : "alertas"} na pré-validação do cálculo`;

export const formatDeadlineDistance = ({
	deadlineStatus,
	daysRemaining,
}: ReviewQueueItem) => {
	if (deadlineStatus === "OVERDUE")
		return `${formatDays(Math.abs(daysRemaining))} de atraso`;
	if (deadlineStatus === "DUE_TODAY") return "Último dia";
	return `Faltam ${formatDays(daysRemaining)}`;
};

export const formatQueueItemOrigin = ({
	municipality,
	ownerName,
}: ReviewQueueItem) => [municipality, ownerName].filter(Boolean).join(", ");

/** What the analyst must know about the row, worst problem first. */
export const getQueueItemAttention = (
	item: ReviewQueueItem,
): TooltipMessage | null => {
	const warnings = item.warnings > 0 ? [formatWarnings(item.warnings)] : [];

	if (item.deadlineStatus === "OVERDUE") {
		return {
			title: `Prazo vencido há ${formatDays(Math.abs(item.daysRemaining))}`,
			details: [`Venceu em ${formatDate(item.deadline)}`, ...warnings],
			action: "Priorize esta análise.",
		};
	}

	if (item.deadlineStatus === "DUE_TODAY") {
		return {
			title: "Prazo vence hoje",
			details: [`Enviado em ${formatDate(item.submittedAt)}`, ...warnings],
			action: "Conclua a análise ainda hoje.",
		};
	}

	if (warnings.length > 0) {
		return {
			title: warnings[0],
			details: [`Prazo até ${formatDate(item.deadline)}`],
			action: "Confira os alertas durante a análise.",
		};
	}

	return null;
};
