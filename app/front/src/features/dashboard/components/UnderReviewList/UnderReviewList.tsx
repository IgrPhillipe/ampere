import { DeadlineStatusBadge } from "@components/DeadlineStatusBadge";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate, padCount } from "@features/shared";
import type { UnderReviewItem } from "@services/dashboard";
import type { DeadlineStatus } from "@services/review-queue";
import { Link } from "@tanstack/react-router";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

const toDeadlineStatus = (daysRemaining: number): DeadlineStatus => {
	if (daysRemaining < 0) return "OVERDUE";

	return daysRemaining === 0 ? "DUE_TODAY" : "ON_TIME";
};

interface UnderReviewListProps {
	items?: UnderReviewItem[];
	className?: string;
}

/** One line per project, the time left in faint versalete on the right. */
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
				{items.map(
					({ id, name, protocol, version, deadline, daysRemaining }) => {
						const deadlineLabel = `${daysRemaining < 0 ? "Venceu" : "Vence"} em ${formatDate(deadline)}`;

						return (
							<li
								key={id}
								className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0"
							>
								<Link
									to="/projetos/$id"
									params={{ id }}
									className="min-w-0 text-sm text-muted-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
								>
									<span className="text-foreground">{name}</span>
									{protocol ? (
										<>
											, <span className="font-mono">{protocol}</span>
										</>
									) : null}{" "}
									<span className="font-mono">v{padCount(version)}</span>
									{version > 1 ? ", reanálise" : null}
								</Link>
								<span title={deadlineLabel} className="shrink-0">
									<DeadlineStatusBadge
										deadlineStatus={toDeadlineStatus(daysRemaining)}
										daysRemaining={daysRemaining}
										withRemaining
										className="font-normal uppercase"
									/>
									<span className="sr-only">. {deadlineLabel}</span>
								</span>
							</li>
						);
					},
				)}
			</ul>
		)}
	</DashboardSection>
);
