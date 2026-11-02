import { DeadlineStatusBadge } from "@components/DeadlineStatusBadge";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate } from "@features/shared";
import type { UnderReviewItem } from "@services/dashboard";
import type { DeadlineStatus } from "@services/review-queue";
import { Link } from "@tanstack/react-router";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

const days = (count: number) => (count === 1 ? "1 dia" : `${count} dias`);

const toDeadlineStatus = (daysRemaining: number): DeadlineStatus => {
	if (daysRemaining < 0) return "OVERDUE";

	return daysRemaining === 0 ? "DUE_TODAY" : "ON_TIME";
};

/** The badge already says "Vence Hoje", so the day count only covers the other two. */
const describeDays = (daysRemaining: number) => {
	if (daysRemaining < 0) return `Há ${days(-daysRemaining)}`;
	if (daysRemaining === 0) return null;

	return `${days(daysRemaining)} ${daysRemaining === 1 ? "restante" : "restantes"}`;
};

interface UnderReviewListProps {
	items?: UnderReviewItem[];
	className?: string;
}

export const UnderReviewList = ({ items, className }: UnderReviewListProps) => (
	<DashboardSection title="Em Análise" className={className}>
		{!items ? (
			<div className="flex flex-col gap-3 py-4">
				<Skeleton className="h-6 w-full" />
				<Skeleton className="h-6 w-full" />
			</div>
		) : items.length === 0 ? (
			<DashboardSectionEmpty>Nenhum projeto em análise.</DashboardSectionEmpty>
		) : (
			<ul className="flex flex-col">
				{items.map(({ id, name, protocol, deadline, daysRemaining }) => {
					const dayCount = describeDays(daysRemaining);

					return (
						<li
							key={id}
							className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border py-3 last:border-b-0"
						>
							<div className="flex flex-col gap-1">
								<Link
									to="/projetos/$id"
									params={{ id }}
									className="text-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
								>
									{name}
									{protocol ? (
										<span className="text-muted-foreground">, {protocol}</span>
									) : null}
								</Link>
								<span className="text-xs text-muted-foreground">
									{daysRemaining < 0 ? "Venceu" : "Vence"} em{" "}
									{formatDate(deadline)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<DeadlineStatusBadge
									deadlineStatus={toDeadlineStatus(daysRemaining)}
								/>
								{dayCount ? (
									<span className="font-mono text-xs text-muted-foreground">
										{dayCount}
									</span>
								) : null}
							</div>
						</li>
					);
				})}
			</ul>
		)}
	</DashboardSection>
);
