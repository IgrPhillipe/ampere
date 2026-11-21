import { describeDeadline } from "@components/DeadlineStatusBadge";
import { Skeleton } from "@components/ui/skeleton";
import { formatDate } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { DashboardSection, DashboardSectionEmpty } from "../DashboardSection";

interface ReviewActionListProps {
	/** The analyst's projects overdue or due today. */
	items?: ReviewQueueItem[];
	className?: string;
}

/** The analyst's "Exige Ação": what is past or at its deadline, with the shortcut to review it. */
export const ReviewActionList = ({
	items,
	className,
}: ReviewActionListProps) => (
	<DashboardSection title="Exige Ação" className={className}>
		{!items ? (
			<div className="flex flex-col gap-4 py-5">
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-16 w-full" />
			</div>
		) : items.length === 0 ? (
			<DashboardSectionEmpty>
				Nenhum projeto atrasado ou vencendo hoje.
			</DashboardSectionEmpty>
		) : (
			<ul className="flex flex-col">
				{items.map((item) => (
					<li
						key={item.id}
						className="border-b border-border py-5 last:border-b-0"
					>
						<div className="flex flex-col gap-2 border-l-2 border-attention pl-4">
							<div className="flex items-baseline justify-between gap-4">
								<span className="text-base font-medium">{item.name}</span>
								{item.deadlineStatus && item.daysRemaining !== null ? (
									<span className="shrink-0 font-mono text-2xs tracking-[0.11em] whitespace-nowrap text-faint-foreground uppercase">
										{describeDeadline(item.deadlineStatus, item.daysRemaining, {
											withRemaining: true,
										})}
									</span>
								) : null}
							</div>
							<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
								<span>{item.protocol}</span>
								<span>
									{item.municipality}/{item.state}
								</span>
								{item.deadline ? (
									<span>vence em {formatDate(item.deadline)}</span>
								) : null}
							</div>
							<Link
								to="/projetos/$id"
								params={{ id: item.id }}
								aria-label={`Analisar ${item.name}`}
								className="group mt-1 inline-flex items-center gap-1.5 self-start text-[0.8125rem] font-medium underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
							>
								Analisar
								<ArrowRight
									aria-hidden="true"
									className="size-3.5 transition-transform group-hover:translate-x-0.5"
								/>
							</Link>
						</div>
					</li>
				))}
			</ul>
		)}
	</DashboardSection>
);
