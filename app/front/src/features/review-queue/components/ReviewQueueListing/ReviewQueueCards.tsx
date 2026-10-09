import { formatKva } from "@features/shared";
import { cn } from "@lib/utils";
import type { ReviewQueueItem } from "@services/review-queue";

import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineIndicator } from "./DeadlineIndicator";
import {
	DeadlineBadge,
	ReanalysisBadge,
	WarningBadge,
} from "./ReviewQueueBadges";
import { formatQueueItemOrigin } from "./review-queue-row";

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
				className="flex flex-col gap-4 border-b border-border px-6 py-5 last:border-b-0"
			>
				<div className="flex flex-col gap-1">
					<span className="font-mono text-xs text-muted-foreground">
						{item.protocol}
					</span>
					<div className="flex items-start justify-between gap-3">
						<span className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
							{item.name}
							{item.reanalysis ? <ReanalysisBadge /> : null}
						</span>
						<DeadlineIndicator deadlineStatus={item.deadlineStatus} />
					</div>
					<span className="text-xs text-muted-foreground">
						{formatQueueItemOrigin(item)}
					</span>
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
