import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { useGetDesignerDashboard } from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { CircleAlert, FolderPlus } from "lucide-react";

import {
	ActionRequiredList,
	DashboardIndicators,
	DashboardPeriodPicker,
	FindingsRanking,
	UnderReviewList,
} from "../../components";
import { dashboardPeriodLabels } from "../../constants";
import { useDashboardPeriod } from "../../hooks";

export const DesignerDashboardPage = () => {
	const [period, setPeriod] = useDashboardPeriod();
	const dashboardQuery = useGetDesignerDashboard(period);
	const dashboard = dashboardQuery.data?.data;
	const hasSubmissions = dashboard?.hasSubmissions ?? true;

	return (
		<PageLayout
			title="Painel"
			description="O que depende de você agora e como seus envios se saíram na análise."
			actions={
				<DashboardPeriodPicker
					value={period}
					onValueChange={(value) => void setPeriod(value)}
				/>
			}
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			{dashboardQuery.isError ? (
				<div className="px-gutter md:px-gutter-md">
					<EmptyState
						title="Não foi possível carregar o painel"
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
					<DashboardIndicators
						indicators={dashboard?.indicators}
						hasSubmissions={hasSubmissions}
						periodLabel={dashboardPeriodLabels[period]}
					/>

					<div className="grid flex-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
						<div className="flex flex-col gap-10 px-gutter py-7 md:px-gutter-md">
							{hasSubmissions ? (
								<>
									<FindingsRanking items={dashboard?.findingsRanking} />
									<UnderReviewList items={dashboard?.underReview} />
								</>
							) : (
								<EmptyState
									title="Nenhum projeto enviado ainda"
									description="Crie um projeto e envie para análise para acompanhar os resultados aqui."
									icon={FolderPlus}
									action={
										<Button
											nativeButton={false}
											render={<Link to="/projetos/novo" />}
										>
											Novo Projeto
										</Button>
									}
								/>
							)}
						</div>

						<ActionRequiredList
							items={dashboard?.actionRequired}
							className="border-t border-border px-gutter py-7 md:px-gutter-md lg:border-t-0 lg:border-l"
						/>
					</div>
				</div>
			)}
		</PageLayout>
	);
};
