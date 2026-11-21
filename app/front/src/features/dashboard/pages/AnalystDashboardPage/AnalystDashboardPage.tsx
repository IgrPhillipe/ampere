import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { formatPercent, padCount } from "@features/shared";
import {
	useGetReviewQueue,
	useGetReviewQueueIndicators,
} from "@services/review-queue";
import { Link } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";

import {
	DashboardBand,
	DashboardLayout,
	DashboardPeriodPicker,
	IndicatorList,
	ReviewActionList,
	ReviewPeriodIndicators,
	UnderReviewList,
} from "../../components";
import { useDashboardPeriod } from "../../hooks";

/** Enough to show what comes next; the whole list is in "Projetos". */
const LISTED = 6;

const filterLink = (label: string, filter?: "APPROVED" | "REJECTED") => (
	<Link
		to="/projetos"
		search={filter ? { filter } : {}}
		className="text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
	>
		{label}
	</Link>
);

/** The analyst's panel: their assigned projects today, then their indicators of the period. */
export const AnalystDashboardPage = () => {
	const [period, setPeriod] = useDashboardPeriod();
	const indicatorsQuery = useGetReviewQueueIndicators();
	const nextQuery = useGetReviewQueue({
		filter: "ALL",
		sort: "deadline",
		direction: "ASC",
		pageSize: LISTED,
	});
	const dueQuery = useGetReviewQueue({
		filter: "DUE_SOON",
		sort: "deadline",
		direction: "ASC",
		pageSize: LISTED,
	});
	const indicators = indicatorsQuery.data?.data;
	const hasError =
		indicatorsQuery.isError || nextQuery.isError || dueQuery.isError;

	return (
		<PageLayout
			title="Painel"
			description="Os projetos atribuídos a você: a faixa e o que exige ação mostram hoje, e os indicadores abaixo seguem o período escolhido."
			actions={
				<DashboardPeriodPicker
					value={period}
					onValueChange={(value) => void setPeriod(value)}
				/>
			}
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			{hasError ? (
				<div className="px-gutter md:px-gutter-md">
					<EmptyState
						title="Não foi possível carregar o painel"
						description="Verifique sua conexão e tente novamente."
						icon={CircleAlert}
						action={
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									void indicatorsQuery.refetch();
									void nextQuery.refetch();
									void dueQuery.refetch();
								}}
							>
								Tentar Novamente
							</Button>
						}
					/>
				</div>
			) : (
				<DashboardLayout
					band={
						<DashboardBand
							title="Seus projetos hoje"
							tiles={[
								{
									label: "Em análise",
									value: indicators && padCount(indicators.total),
								},
								{
									label: "Vencendo o prazo",
									value: indicators && padCount(indicators.dueSoon),
								},
								{
									label: "Analisados hoje",
									value: indicators && padCount(indicators.reviewedToday),
								},
								{
									label: "Reprovação no mês",
									value:
										indicators &&
										formatPercent(indicators.monthlyRejectionPercent),
								},
							]}
						/>
					}
					main={
						<>
							<UnderReviewList
								items={nextQuery.data?.data.flatMap(
									({
										id,
										name,
										protocol,
										reviewCycle,
										deadline,
										daysRemaining,
									}) =>
										deadline === null || daysRemaining === null
											? []
											: [
													{
														id,
														name,
														protocol,
														version: reviewCycle,
														deadline,
														daysRemaining,
													},
												],
								)}
							/>
							<IndicatorList
								title="Seus Projetos"
								items={
									indicators && [
										{
											key: "under-review",
											label: filterLink("Em análise"),
											value: padCount(indicators.total),
										},
										{
											key: "approved",
											label: filterLink("Aprovados", "APPROVED"),
											value: padCount(indicators.approved),
										},
										{
											key: "rejected",
											label: filterLink("Reprovados", "REJECTED"),
											value: padCount(indicators.rejected),
										},
									]
								}
								emptyMessage="Nenhum projeto atribuído a você."
							/>
							<ReviewPeriodIndicators period={period} />
						</>
					}
					aside={<ReviewActionList items={dueQuery.data?.data} />}
				/>
			)}
		</PageLayout>
	);
};
