import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { buildingTypeLabels } from "@features/projects";
import { formatPercent, padCount } from "@features/shared";
import dayjs from "@lib/dayjs";
import {
	type DashboardPeriod,
	type ReviewDashboard,
	useGetReviewDashboard,
} from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";

import { dashboardPeriodLabels } from "../../constants";
import { FindingsRanking } from "../FindingsRanking";
import { IndicatorList, type IndicatorListItem } from "../IndicatorList";
import { WeeklyReviewChart } from "../WeeklyReviewChart";

const formatDays = (value: number | null, emptyLabel: string) =>
	value === null
		? emptyLabel
		: `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${value === 1 ? "dia" : "dias"}`;

const plural = (count: number, one: string, many: string) =>
	`${count} ${count === 1 ? one : many}`;

const capitalize = (text: string) =>
	text.charAt(0).toUpperCase() + text.slice(1);

const totalItems = ({ totals }: ReviewDashboard): IndicatorListItem[] => [
	{ key: "received", label: "Recebidos", value: padCount(totals.received) },
	{ key: "approved", label: "Aprovados", value: padCount(totals.approved) },
	{ key: "rejected", label: "Reprovados", value: padCount(totals.rejected) },
];

const hasTimes = ({
	averageReviewDays,
	averageCycleDays,
	deadlines,
}: ReviewDashboard) =>
	averageReviewDays !== null ||
	averageCycleDays !== null ||
	deadlines.met + deadlines.overdue > 0;

const timeItems = (dashboard: ReviewDashboard): IndicatorListItem[] =>
	hasTimes(dashboard)
		? [
				{
					key: "review",
					label: "Tempo médio de análise",
					value: formatDays(dashboard.averageReviewDays, "Sem decisão"),
				},
				{
					key: "cycle",
					label: "Ciclo completo até a aprovação",
					value: formatDays(dashboard.averageCycleDays, "Sem aprovação"),
				},
				{
					key: "met",
					label: "Prazos cumpridos",
					value: padCount(dashboard.deadlines.met),
				},
				{
					key: "overdue",
					label: "Prazos vencidos",
					value: padCount(dashboard.deadlines.overdue),
				},
			]
		: [];

const monthlyItems = (dashboard: ReviewDashboard): IndicatorListItem[] =>
	dashboard.monthlyRejection.map(({ month, rejectionPercent }) => ({
		key: month,
		label: capitalize(dayjs(`${month}-01`).format("MMMM [de] YYYY")),
		value:
			rejectionPercent === null
				? "Sem decisão"
				: formatPercent(rejectionPercent),
	}));

const categoryItems = (dashboard: ReviewDashboard): IndicatorListItem[] =>
	dashboard.alertsByCategory.map(({ category, alerts, projects }) => ({
		key: category,
		label: `${buildingTypeLabels[category]}, ${plural(projects, "projeto", "projetos")}`,
		value: plural(alerts, "alerta", "alertas"),
	}));

const municipalityItems = (dashboard: ReviewDashboard): IndicatorListItem[] =>
	dashboard.municipalities.map(({ municipality, state, total }) => ({
		key: `${municipality}/${state}`,
		label: `${municipality}/${state}`,
		value: padCount(total),
	}));

const repeatedRejectionItems = (
	dashboard: ReviewDashboard,
): IndicatorListItem[] =>
	dashboard.repeatedRejections.map(({ id, name, protocol, rejections }) => ({
		key: id,
		label: (
			<span className="flex items-baseline gap-3">
				<span className="font-mono text-xs">{protocol}</span>
				<Link
					to="/projetos/$id"
					params={{ id }}
					className="text-foreground hover:underline focus-visible:underline focus-visible:outline-none"
				>
					{name}
				</Link>
			</span>
		),
		value: `${rejections} reprovações`,
	}));

interface ReviewPeriodIndicatorsProps {
	period: DashboardPeriod;
}

/**
 * US17: the review indicators of the period, below what the panel shows for today. The back
 * scopes them: the analyst's assigned projects, or the whole team for the admin. A failure here
 * leaves the rest of the panel in place.
 */
export const ReviewPeriodIndicators = ({
	period,
}: ReviewPeriodIndicatorsProps) => {
	const dashboardQuery = useGetReviewDashboard(period);
	const dashboard = dashboardQuery.data?.data;
	const itemsOf = (build: (value: ReviewDashboard) => IndicatorListItem[]) =>
		dashboard ? build(dashboard) : undefined;

	if (dashboardQuery.isError) {
		return (
			<EmptyState
				title="Não foi possível carregar os indicadores do período"
				description="O restante do painel segue atualizado. Tente carregar os indicadores de novo."
				icon={CircleAlert}
				action={
					<Button
						type="button"
						variant="outline"
						onClick={() => void dashboardQuery.refetch()}
					>
						Tentar Novamente
					</Button>
				}
			/>
		);
	}

	return (
		<>
			<IndicatorList
				title="Projetos no Período"
				caption={dashboardPeriodLabels[period]}
				items={itemsOf(totalItems)}
				emptyMessage="Nenhum projeto no período."
			/>
			<WeeklyReviewChart weeks={dashboard?.weekly} />
			<FindingsRanking
				title="Apontamentos Mais Frequentes"
				emptyMessage="Nenhum apontamento emitido no período."
				items={dashboard?.findingsRanking}
			/>
			<IndicatorList
				title="Tempos e Prazos"
				items={itemsOf(timeItems)}
				emptyMessage="Sem análises no período."
			/>
			<IndicatorList
				title="Taxa de Reprovação"
				caption="Por mês"
				items={itemsOf(monthlyItems)}
				emptyMessage="Nenhuma decisão no período."
			/>
			<IndicatorList
				title="Alertas por Categoria"
				caption="Da edificação"
				items={itemsOf(categoryItems)}
				emptyMessage="Nenhum projeto recebido no período."
			/>
			<IndicatorList
				title="Municípios com Mais Projetos"
				items={itemsOf(municipalityItems)}
				emptyMessage="Nenhum projeto recebido no período."
			/>
			<IndicatorList
				title="Mais de Uma Reprovação"
				caption="Projetos"
				items={itemsOf(repeatedRejectionItems)}
				emptyMessage="Nenhum projeto reprovado mais de uma vez no período."
			/>
		</>
	);
};
