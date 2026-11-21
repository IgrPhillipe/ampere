import type { DeadlineStatus } from "@services/review-queue";

export const formatDays = (count: number) =>
	count === 1 ? "1 dia" : `${count} dias`;

export interface DescribeDeadlineOptions {
	/** "18 dias restantes" instead of "18 dias". */
	withRemaining?: boolean;
}

/** The deadline as the Figma writes it: "2 dias", "Vence hoje", "Atrasado 1 dia". */
export const describeDeadline = (
	deadlineStatus: DeadlineStatus,
	daysRemaining: number,
	{ withRemaining = false }: DescribeDeadlineOptions = {},
) => {
	if (deadlineStatus === "OVERDUE") {
		return `Atrasado ${formatDays(Math.abs(daysRemaining))}`;
	}
	if (deadlineStatus === "DUE_TODAY") return "Vence hoje";
	if (!withRemaining) return formatDays(daysRemaining);

	return `${formatDays(daysRemaining)} ${daysRemaining === 1 ? "restante" : "restantes"}`;
};
