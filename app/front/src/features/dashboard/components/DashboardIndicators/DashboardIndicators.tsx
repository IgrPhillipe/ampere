import { Skeleton } from "@components/ui/skeleton";
import { formatDecimal, formatPercent, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { DesignerIndicators } from "@services/dashboard";

const formatNumber = (value: number) =>
	value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

interface DashboardIndicatorsProps {
	/** Without `indicators` the band shows skeletons. */
	indicators?: DesignerIndicators;
	/** False before the first submission: the band explains instead of counting. */
	hasSubmissions?: boolean;
	periodLabel: string;
	className?: string;
}

interface IndicatorTile {
	label: string;
	/** `null` when the period has nothing to measure. */
	format: (indicators: DesignerIndicators) => string | null;
	/** Shown in place of a `null` value. */
	emptyLabel?: string;
}

const TILES: IndicatorTile[] = [
	{
		label: "Projetos enviados",
		format: ({ submitted }) => padCount(submitted),
	},
	{
		label: "Aprovados na 1ª análise",
		format: ({ firstReviewApprovalPercent }) =>
			firstReviewApprovalPercent === null
				? null
				: formatPercent(firstReviewApprovalPercent),
		emptyLabel: "Sem análise",
	},
	{
		label: "Tempo médio até aprovação",
		format: ({ averageDaysToApproval }) =>
			averageDaysToApproval === null
				? null
				: `${formatNumber(averageDaysToApproval)} d`,
		emptyLabel: "Sem aprovação",
	},
	{
		label: "kVA de demanda aprovada",
		format: ({ approvedDemand }) => formatDecimal(approvedDemand, 2),
	},
];

/** Green band with the period's indicators, edge to edge like `FilterTiles`. */
export const DashboardIndicators = ({
	indicators,
	hasSubmissions = true,
	periodLabel,
	className,
}: DashboardIndicatorsProps) => (
	<section
		aria-labelledby="dashboard-indicators-title"
		className={cn("bg-primary text-primary-foreground", className)}
	>
		<h2
			id="dashboard-indicators-title"
			className="px-gutter pt-5 font-mono text-xs tracking-wider uppercase opacity-80 md:px-gutter-md"
		>
			Indicadores do período, {periodLabel}
		</h2>

		{hasSubmissions ? (
			<dl className="grid grid-cols-2 lg:grid-cols-4">
				{TILES.map(({ label, format, emptyLabel }) => {
					const value = indicators ? format(indicators) : undefined;

					return (
						<div
							key={label}
							className="flex min-h-28 flex-col-reverse justify-center gap-2 border-primary-foreground/20 pr-5 pl-gutter odd:border-r md:pl-gutter-md lg:border-r lg:last:border-r-0"
						>
							<dt className="font-mono text-xs tracking-wider uppercase opacity-80">
								{label}
							</dt>
							<dd className="font-mono text-3xl font-semibold whitespace-nowrap sm:text-4xl">
								{value === undefined ? (
									<Skeleton className="h-10 w-16 bg-primary-foreground/25" />
								) : (
									(value ?? (
										<span className="text-base font-medium">{emptyLabel}</span>
									))
								)}
							</dd>
						</div>
					);
				})}
			</dl>
		) : (
			<p className="px-gutter pt-3 pb-6 text-base md:px-gutter-md">
				Os indicadores aparecem depois do primeiro envio.
			</p>
		)}
	</section>
);
