import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";
import type { ReviewQueueIndicators as Indicators } from "@services/review-queue";

const formatPercent = (value: number) =>
	`${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

const indicatorTiles: Array<{
	label: string;
	format: (indicators: Indicators) => string;
}> = [
	{ label: "Projetos na fila", format: ({ total }) => String(total) },
	{ label: "Vencendo o prazo", format: ({ dueSoon }) => String(dueSoon) },
	{
		label: "Analisados hoje",
		format: ({ reviewedToday }) => String(reviewedToday),
	},
	{
		label: "Reprovados no mês",
		format: ({ monthlyRejectionPercent }) =>
			formatPercent(monthlyRejectionPercent),
	},
];

interface ReviewQueueIndicatorsProps {
	indicators?: Indicators;
	isLoading?: boolean;
	className?: string;
}

export const ReviewQueueIndicators = ({
	indicators,
	isLoading = false,
	className,
}: ReviewQueueIndicatorsProps) => (
	<section
		aria-label="Indicadores da fila"
		aria-busy={isLoading}
		className={cn(
			"overflow-x-auto bg-primary text-primary-foreground",
			className,
		)}
	>
		<dl className="grid min-w-2xl grid-cols-4">
			{indicatorTiles.map(({ label, format }) => (
				<div
					key={label}
					className="flex min-h-30 flex-col-reverse justify-center gap-2 border-r border-primary-foreground/20 px-gutter last:border-r-0 md:px-gutter-md"
				>
					<dt className="font-mono text-xs tracking-wider uppercase opacity-80">
						{label}
					</dt>
					<dd className="font-mono text-4xl font-semibold tabular-nums">
						{indicators && !isLoading ? (
							format(indicators)
						) : (
							<Skeleton className="h-10 w-16 bg-primary-foreground/25" />
						)}
					</dd>
				</div>
			))}
		</dl>
	</section>
);
