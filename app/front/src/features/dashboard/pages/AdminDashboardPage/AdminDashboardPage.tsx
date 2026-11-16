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

	return (
		<PageLayout
			title="Painel"
			description="Acompanhamento operacional, estado dos usuários e fila de análise."
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
					<AdminUsersSection
						users={dashboard?.users}
						isLoading={dashboardQuery.isPending}
					/>

					<div className="grid flex-1 gap-10 px-gutter py-7 md:px-gutter-md lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
						<AdminActiveProjectsSection />
						<div className="border-t border-border pt-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
							<AdminQueueSection
								queue={dashboard?.queue}
								isLoading={dashboardQuery.isPending}
							/>
						</div>
					</div>
				</div>
			)}
		</PageLayout>
	);
};
