import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { useGetAdminDashboard } from "@services/dashboard";
import { CircleAlert } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";

import {
	AdminActiveProjectsSection,
	AdminQueueSection,
	AdminUsersSection,
	DashboardPeriodPicker,
} from "../../components";
import { useDashboardPeriod } from "../../hooks";
import { ReviewIndicatorsPanel } from "../ReviewDashboardPage";

const TABS = ["operacao", "analise"] as const;

/** The tab lives in `?aba=`, so a link opens the indicators directly. */
const useAdminDashboardTab = () =>
	useQueryState("aba", parseAsStringLiteral(TABS).withDefault("operacao"));

export const AdminDashboardPage = () => {
	const dashboardQuery = useGetAdminDashboard();
	const dashboard = dashboardQuery.data?.data;
	// The projects table has its own query, so it stays when the counters fail.
	const hasCountersError = dashboardQuery.isError;
	const [tab, setTab] = useAdminDashboardTab();
	const [period, setPeriod] = useDashboardPeriod();

	return (
		<PageLayout
			title="Painel"
			description={
				tab === "analise"
					? "A demanda da equipe de análise e os apontamentos mais frequentes nos projetos recebidos."
					: "Acompanhamento operacional, estado dos usuários e fila de análise."
			}
			actions={
				tab === "analise" ? (
					<DashboardPeriodPicker
						value={period}
						onValueChange={(value) => void setPeriod(value)}
					/>
				) : undefined
			}
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<Tabs
				value={tab}
				onValueChange={(value) =>
					void setTab(value === "analise" ? value : null)
				}
				className="flex-1 gap-0"
			>
				<TabsList className="w-full justify-start px-gutter md:px-gutter-md">
					<TabsTrigger value="operacao" className="flex-none">
						Operação
					</TabsTrigger>
					<TabsTrigger value="analise" className="flex-none">
						Indicadores da Análise
					</TabsTrigger>
				</TabsList>

				<TabsContent value="analise" className="flex flex-col">
					<ReviewIndicatorsPanel period={period} />
				</TabsContent>

				<TabsContent value="operacao" className="flex flex-col">
					<div className="flex flex-1 flex-col bg-card">
						{hasCountersError ? (
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
							<AdminUsersSection
								users={dashboard?.users}
								isLoading={dashboardQuery.isPending}
							/>
						)}

						{/* Stacked: the projects table needs the full width for its columns. */}
						<div className="flex flex-1 flex-col gap-7 px-gutter py-7 md:px-gutter-md">
							<AdminActiveProjectsSection />
							{hasCountersError ? null : (
								<AdminQueueSection
									queue={dashboard?.queue}
									isLoading={dashboardQuery.isPending}
									className="border-t border-border pt-7"
								/>
							)}
						</div>
					</div>
				</TabsContent>
			</Tabs>
		</PageLayout>
	);
};
