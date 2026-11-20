import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { buildingTypeLabels } from "@features/projects";
import { formatPercent, padCount, useAuthStore } from "@features/shared";
import dayjs from "@lib/dayjs";
import {
	type DashboardPeriod,
	type ReviewDashboard,
	useGetReviewDashboard,
} from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";

import {
	DashboardPeriodPicker,
	FindingsRanking,
	IndicatorList,
	type IndicatorListItem,
	ReviewIndicators,
	WeeklyReviewChart,
} from "../../components";
import { dashboardPeriodLabels } from "../../constants";
import { useDashboardPeriod } from "../../hooks";

const formatDays = (value: number | null, emptyLabel: string) =>
	value === null
		? emptyLabel
		: `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${value === 1 ? "dia" : "dias"}`;

const plural = (count: number, one: string, many: string) =>
	`${count} ${count === 1 ? one : many}`;

const capitalize = (text: string) =>
	text.charAt(0).toUpperCase() + text.slice(1);

const timeItemsOf = (dashboard: ReviewDashboard): IndicatorListItem[] => [
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
	hasTimes(dashboard) ? timeItemsOf(dashboard) : [];

const categoryItems = (dashboard: ReviewDashboard): IndicatorListItem[] =>
	dashboard.alertsByCategory.map(({ category, alerts, projects }) => ({
		key: category,
		label: `${buildingTypeLabels[category]}, ${plural(projects, "projeto", "projetos")}`,
		value: plural(alerts, "alerta", "alertas"),
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

const monthlyItems = (dashboard: ReviewDashboard): IndicatorListItem[] =>
	dashboard.monthlyRejection.map(({ month, rejectionPercent }) => ({
		key: month,
		label: capitalize(dayjs(`${month}-01`).format("MMMM [de] YYYY")),
		value:
			rejectionPercent === null
				? "Sem decisão"
				: formatPercent(rejectionPercent),
	}));

const workloadItems = (dashboard: ReviewDashboard): IndicatorListItem[] =>
	dashboard.workload.map(({ id, name, underReview }) => ({
		key: id,
		label: name,
		value: padCount(underReview),
	}));

const municipalityItems = (dashboard: ReviewDashboard): IndicatorListItem[] =>
	dashboard.municipalities.map(({ municipality, state, total }) => ({
		key: `${municipality}/${state}`,
		label: `${municipality}/${state}`,
		value: padCount(total),
	}));

/** The back scopes the numbers: the analyst's assigned projects, or the whole team for the admin. */
const SCOPE_COPY = {
	reviewer: {
		description:
			"Os projetos atribuídos a você, com os prazos e os apontamentos mais frequentes.",
		band: "Seus projetos no período",
	},
	admin: {
		description:
			"A demanda da equipe de análise e os apontamentos mais frequentes nos projetos recebidos.",
		band: "Projetos da equipe no período",
	},
} as const;

interface ReviewIndicatorsPanelProps {
	period: DashboardPeriod;
}

/** H12: the indicators of the period, scoped by the role; the admin reads them in the panel. */
export const ReviewIndicatorsPanel = ({
	period,
}: ReviewIndicatorsPanelProps) => {
	const isAdmin = useAuthStore((state) => state.user?.role) === "admin";
	const copy = SCOPE_COPY[isAdmin ? "admin" : "reviewer"];
	const dashboardQuery = useGetReviewDashboard(period);
	const dashboard = dashboardQuery.data?.data;
	const itemsOf = (build: (value: ReviewDashboard) => IndicatorListItem[]) =>
		dashboard ? build(dashboard) : undefined;

	return dashboardQuery.isError ? (
		<div className="px-gutter md:px-gutter-md">
			<EmptyState
				title="Não foi possível carregar os indicadores"
				description="Verifique sua conexão e tente novamente."
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
		</div>
	) : (
		<div className="flex flex-1 flex-col bg-card">
			<ReviewIndicators
				totals={dashboard?.totals}
				title={`${copy.band}, ${dashboardPeriodLabels[period]}`}
			/>

			<div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
				<div className="flex flex-col gap-10 px-gutter py-7 md:px-gutter-md">
					<FindingsRanking
						title="Apontamentos Mais Frequentes"
						emptyMessage="Nenhum apontamento emitido no período."
						items={dashboard?.findingsRanking}
					/>
					<WeeklyReviewChart weeks={dashboard?.weekly} />
					<IndicatorList
						title="Mais de Uma Reprovação"
						caption="Projetos"
						items={itemsOf(repeatedRejectionItems)}
						emptyMessage="Nenhum projeto reprovado mais de uma vez no período."
					/>
				</div>

				<div className="flex flex-col gap-10 border-t border-border px-gutter py-7 md:px-gutter-md lg:border-t-0 lg:border-l">
					<IndicatorList
						title="Tempos e Prazos"
						items={itemsOf(timeItems)}
						emptyMessage="Sem análises no período."
					/>
					<IndicatorList
						title="Alertas por Categoria"
						caption="Da edificação"
						items={itemsOf(categoryItems)}
						emptyMessage="Nenhum alerta nos projetos recebidos no período."
					/>
					<IndicatorList
						title="Taxa de Reprovação"
						caption="Por mês"
						items={itemsOf(monthlyItems)}
						emptyMessage="Nenhuma decisão no período."
					/>
					{isAdmin ? (
						<IndicatorList
							title="Em Análise por Analista"
							items={itemsOf(workloadItems)}
							emptyMessage="Nenhum projeto em análise."
						/>
					) : null}
					<IndicatorList
						title="Municípios com Mais Projetos"
						items={itemsOf(municipalityItems)}
						emptyMessage="Nenhum projeto recebido no período."
					/>
				</div>
			</div>
		</div>
	);
};

/** The analyst's indicators page. */
export const ReviewDashboardPage = () => {
	const [period, setPeriod] = useDashboardPeriod();

	return (
		<PageLayout
			title="Indicadores"
			description={SCOPE_COPY.reviewer.description}
			actions={
				<DashboardPeriodPicker
					value={period}
					onValueChange={(value) => void setPeriod(value)}
				/>
			}
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<ReviewIndicatorsPanel period={period} />
		</PageLayout>
	);
};
