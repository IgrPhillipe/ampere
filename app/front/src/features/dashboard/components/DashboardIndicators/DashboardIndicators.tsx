import { formatDecimal, formatPercent, padCount } from "@features/shared";
import type { DesignerIndicators } from "@services/dashboard";

import { DashboardBand } from "../DashboardBand";

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

/** The designer's band: the period's indicators. */
export const DashboardIndicators = ({
	indicators,
	hasSubmissions = true,
	periodLabel,
	className,
}: DashboardIndicatorsProps) => (
	<DashboardBand
		title={`Indicadores do período, ${periodLabel}`}
		tiles={TILES.map(({ label, format, emptyLabel }) => ({
			label,
			value: indicators ? format(indicators) : undefined,
			emptyLabel,
		}))}
		empty={
			hasSubmissions
				? undefined
				: "Os indicadores aparecem depois do primeiro envio."
		}
		className={className}
	/>
);
