import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { useGetAdminDashboard } from "@services/dashboard";
import { CircleAlert } from "lucide-react";

import {
	AdminActiveProjectsSection,
	AdminQueueSection,
	AdminUsersSection,
} from "../../components";

export const AdminDashboardPage = () => {
	const dashboardQuery = useGetAdminDashboard();
	const dashboard = dashboardQuery.data?.data;
	// The projects table has its own query, so it stays when the counters fail.
	const hasCountersError = dashboardQuery.isError;

	return (
		<PageLayout
			title="Painel"
			description="Acompanhamento operacional, estado dos usuários e fila de análise."
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
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
		</PageLayout>
	);
};
