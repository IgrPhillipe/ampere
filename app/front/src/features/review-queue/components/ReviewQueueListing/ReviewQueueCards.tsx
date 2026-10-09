import { formatKva } from "@features/shared";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { ReviewQueueItem } from "@services/review-queue";

import { DeadlineIndicator } from "./DeadlineIndicator";
import { ReviewQueueStatusSummary } from "./ReviewQueueStatusSummary";
import { formatQueueItemOrigin } from "./review-queue-row";
import { WarningsBadge } from "./WarningsBadge";

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
				className="flex flex-col gap-3 border-b border-border px-6 py-4 last:border-b-0"
			>
				<div className="flex flex-col gap-1">
					<div className="flex items-start justify-between gap-3">
						<span className="font-semibold text-foreground">{item.name}</span>
						<DeadlineIndicator deadlineStatus={item.deadlineStatus} />
					</div>

					<span className="text-xs text-muted-foreground">
						{formatQueueItemOrigin(item)}
					</span>

					<span className="font-mono text-xs text-muted-foreground">
						Protocolo {item.protocol}
					</span>
				</div>

				<ReviewQueueStatusSummary item={item} />

				<dl className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
					<div className="flex gap-1.5">
						<dt>UCs</dt>
						<dd className="font-mono">{item.consumerUnitsCount}</dd>
					</div>

					<div className="flex gap-1.5">
						<dt>Demanda</dt>
						<dd className="font-mono">
							{item.demandKva === null
								? "Sem cálculo"
								: formatKva(item.demandKva, 1)}
						</dd>
					</div>

					<div className="flex gap-1.5">
						<dt>Prazo</dt>
						<dd>
							<time dateTime={item.deadline} className="font-mono">
								{dayjs(item.deadline).format("DD.MM.YYYY")}
							</time>
						</dd>
					</div>

					<div className="flex items-center gap-1.5">
						<dt className="sr-only">Pré-validação</dt>
						<dd>
							<WarningsBadge warnings={item.warnings} />
						</dd>
					</div>
				</dl>
			</li>
		))}
	</ul>
);
