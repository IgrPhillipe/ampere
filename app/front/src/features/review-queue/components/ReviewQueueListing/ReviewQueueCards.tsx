import { Badge } from "@components/ui/badge";
import { formatKva } from "@features/shared";
import { cn } from "@lib/utils";
import type { ReviewQueueItem } from "@services/review-queue";

import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineBadge, WarningBadge } from "./ReviewQueueBadges";

interface ReviewQueueCardsProps {
	items: ReviewQueueItem[];
	className?: string;
}

export const ReviewQueueCards = ({
	items,
	className,
}: ReviewQueueCardsProps) => (
	<ul className={cn("flex flex-col bg-card", className)}>
		{items.map((item) => (
			<li
				key={item.id}
				className={cn(
					"relative flex flex-col gap-4 border-b border-border px-6 py-5 last:border-b-0",
					item.deadlineStatus !== "ON_TIME" &&
						"before:absolute before:top-5 before:left-0 before:h-7 before:w-0.5 before:bg-brand-sunset",
				)}
			>
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 flex-col gap-1">
						<span className="font-mono text-xs text-muted-foreground">
							{item.protocol}
						</span>
						<span className="font-semibold text-foreground">{item.name}</span>
						<span className="text-xs text-muted-foreground">
							{item.municipality}
							{item.applicantName ? ` · ${item.applicantName}` : ""}
						</span>
					</div>
					{item.reanalysis ? <Badge variant="success">Reanálise</Badge> : null}
				</div>

				<dl className="grid grid-cols-2 gap-3 text-xs">
					<div>
						<dt className="text-muted-foreground">UCs</dt>
						<dd className="font-mono">{item.consumerUnitsCount}</dd>
					</div>
					<div>
						<dt className="text-muted-foreground">Demanda</dt>
						<dd className="font-mono">
							{item.demandKva === null
								? "Sem cálculo"
								: formatKva(item.demandKva, 1)}
						</dd>
					</div>
					<div className="flex flex-col items-start gap-1">
						<dt className="text-muted-foreground">Pré-validação</dt>
						<dd>
							<WarningBadge warnings={item.warnings} />
						</dd>
					</div>
					<div className="flex flex-col items-start gap-1">
						<dt className="text-muted-foreground">Prazo</dt>
						<dd>
							<DeadlineBadge
								deadlineStatus={item.deadlineStatus}
								daysRemaining={item.daysRemaining}
							/>
						</dd>
					</div>
				</dl>

				<div className="flex justify-end">
					<AnalyzeButton />
				</div>
			</li>
		))}
	</ul>
);
