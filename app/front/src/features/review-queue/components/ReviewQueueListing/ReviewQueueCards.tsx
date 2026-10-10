import { formatDate, formatKva, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ReviewQueueItem } from "@services/review-queue";

import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineStatusBadge } from "./DeadlineStatusBadge";
import { QueueItemIndicator } from "./QueueItemIndicator";
import {
	formatQueueItemOrigin,
	formatReviewCycle,
	isUrgent,
} from "./review-queue-row";

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
						<QueueItemIndicator item={item} />
					</div>

					<span className="text-xs text-muted-foreground">
						{formatQueueItemOrigin(item)}
					</span>

					<span className="font-mono text-xs text-muted-foreground">
						Protocolo {item.protocol}
					</span>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<DeadlineStatusBadge deadlineStatus={item.deadlineStatus} />
					<span className="text-xs text-muted-foreground">
						{formatReviewCycle(item)}
					</span>
				</div>

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
								{formatDate(item.deadline)}
							</time>
						</dd>
					</div>

					{item.warnings > 0 ? (
						<div className="flex gap-1.5">
							<dt>Alertas</dt>
							<dd className="font-mono font-semibold text-foreground">
								{padCount(item.warnings)}
							</dd>
						</div>
					) : null}
				</dl>

				<div className="flex justify-end">
					<AnalyzeButton urgent={isUrgent(item)} buttonClassName="w-32" />
				</div>
			</li>
		))}
	</ul>
);
