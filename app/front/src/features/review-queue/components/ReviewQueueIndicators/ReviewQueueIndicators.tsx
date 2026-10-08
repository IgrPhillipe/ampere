import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { useGetReviewQueueIndicators } from "@services/review-queue";
import { CircleAlert } from "lucide-react";

const indicatorLabels = {
	total: "Projetos na fila",
	dueSoon: "Vencendo o prazo",
	reviewedToday: "Analisados hoje",
	monthlyRejectionPercent: "Reprovados no mês",
} as const;

const formatPercent = (value: number) =>
	`${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export const ReviewQueueIndicators = () => {
	const query = useGetReviewQueueIndicators();

	if (query.isPending) {
		return (
			<section
				aria-label="Carregando indicadores da fila"
				className="grid min-h-28 grid-cols-2 bg-primary px-gutter py-5 text-primary-foreground md:grid-cols-4 md:px-gutter-md"
			>
				{Object.values(indicatorLabels).map((label) => (
					<div
						key={label}
						className="flex flex-col gap-2 border-primary-foreground/20 px-3 first:pl-0 md:border-l md:first:border-l-0"
					>
						<Skeleton className="h-9 w-16 bg-primary-foreground/25" />
						<Skeleton className="h-3 w-28 bg-primary-foreground/25" />
					</div>
				))}
			</section>
		);
	}

	if (query.isError) {
		return (
			<section
				role="alert"
				className="flex flex-wrap items-center justify-between gap-3 border-y border-destructive/20 bg-destructive/10 px-gutter py-4 text-destructive md:px-gutter-md"
			>
				<p className="flex items-center gap-2 text-sm font-medium">
					<CircleAlert aria-hidden="true" className="size-4" />
					Não foi possível carregar os indicadores da fila.
				</p>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => void query.refetch()}
				>
					Tentar novamente
				</Button>
			</section>
		);
	}

	const indicators = query.data.data;
	const values = [
		{ label: indicatorLabels.total, value: indicators.total },
		{ label: indicatorLabels.dueSoon, value: indicators.dueSoon },
		{ label: indicatorLabels.reviewedToday, value: indicators.reviewedToday },
		{
			label: indicatorLabels.monthlyRejectionPercent,
			value: formatPercent(indicators.monthlyRejectionPercent),
		},
	];

	return (
		<section
			aria-label="Indicadores da fila"
			className="bg-primary px-gutter py-4 text-primary-foreground md:px-gutter-md"
		>
			<p className="mb-3 font-mono text-xs tracking-wider uppercase opacity-75">
				Indicadores da fila
			</p>
			<dl className="grid grid-cols-2 gap-y-5 md:grid-cols-4 md:gap-y-0">
				{values.map(({ label, value }) => (
					<div
						key={label}
						className="border-primary-foreground/20 px-3 first:pl-0 md:border-l md:first:border-l-0"
					>
						<dd className="font-mono text-2xl font-semibold tabular-nums">
							{value}
						</dd>
						<dt className="mt-1 font-mono text-xs tracking-wider uppercase opacity-75">
							{label}
						</dt>
					</div>
				))}
			</dl>
		</section>
	);
};
