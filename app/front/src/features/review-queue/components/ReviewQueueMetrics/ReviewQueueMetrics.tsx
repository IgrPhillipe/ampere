import { Skeleton } from "@components/ui/skeleton";
import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { ReviewQueueIndicators } from "@services/review-queue";

const formatPercent = (value: number) =>
	`${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

interface ReviewQueueMetricsProps {
	indicators?: ReviewQueueIndicators;
	className?: string;
}

export const ReviewQueueMetrics = ({
	indicators,
	className,
}: ReviewQueueMetricsProps) => {
	const metrics = [
		{
			label: "Analisados hoje",
			value: indicators && padCount(indicators.reviewedToday),
		},
		{
			label: "Reprovados no mês",
			value: indicators && formatPercent(indicators.monthlyRejectionPercent),
		},
	];

	return (
		<dl className={cn("flex gap-8", className)}>
			{metrics.map(({ label, value }) => (
				<div key={label} className="flex flex-col gap-1">
					<dt className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
						{label}
					</dt>
					<dd className="font-mono text-2xl font-semibold text-foreground">
						{value ?? <Skeleton className="h-8 w-14" />}
					</dd>
				</div>
			))}
		</dl>
	);
};
