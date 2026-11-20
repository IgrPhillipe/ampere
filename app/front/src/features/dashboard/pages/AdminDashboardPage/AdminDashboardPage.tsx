import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { useGetAdminDashboard } from "@services/dashboard";
import { CircleAlert } from "lucide-react";

import {
	AdminQueueSection,
	AdminUsersSection,
	DashboardPeriodPicker,
} from "../../components";
import { useDashboardPeriod } from "../../hooks";
import { ReviewIndicatorsPanel } from "../ReviewDashboardPage";

/** The manager's panel holds numbers only: the projects themselves are listed in "Projetos". */
export const AdminDashboardPage = () => {
	const dashboardQuery = useGetAdminDashboard();
	const dashboard = dashboardQuery.data?.data;
	const [period, setPeriod] = useDashboardPeriod();

	return (
		<PageLayout
			title="Painel"
			description="Usuários e fila de análise agora, e os indicadores da equipe no período."
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<div className="flex flex-1 flex-col bg-card">
				{dashboardQuery.isError ? (
					<div className="border-b border-border px-gutter py-7 md:px-gutter-md">
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
					<>
						<AdminUsersSection
							users={dashboard?.users}
							isLoading={dashboardQuery.isPending}
						/>
						<AdminQueueSection
							queue={dashboard?.queue}
							isLoading={dashboardQuery.isPending}
							className="px-gutter py-7 md:px-gutter-md"
						/>
					</>
				)}

				<section
					aria-labelledby="indicadores-analise"
					className="flex flex-col border-t border-border"
				>
					<SectionHeading
						id="indicadores-analise"
						actions={
							<DashboardPeriodPicker
								value={period}
								onValueChange={(value) => void setPeriod(value)}
							/>
						}
						className="px-gutter pt-7 pb-5 md:px-gutter-md"
					>
						Indicadores da Análise
					</SectionHeading>
					<ReviewIndicatorsPanel period={period} />
				</section>
			</div>
		</PageLayout>
	);
};
