import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { padCount } from "@features/shared";
import { userRolePluralLabels } from "@features/users";
import { useGetAdminDashboard } from "@services/dashboard";
import { Link } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

import {
	AdminActionList,
	DashboardBand,
	DashboardLayout,
	IndicatorList,
} from "../../components";

const usersLink = (
	label: string,
	search: Record<string, string | number | boolean>,
): ReactNode => (
	<Link
		to="/usuarios"
		search={search}
		className="text-foreground underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
	>
		{label}
	</Link>
);

const plural = (count: number) => (count === 1 ? "projeto" : "projetos");

/** The manager's panel: numbers only, laid out like every other panel. */
export const AdminDashboardPage = () => {
	const dashboardQuery = useGetAdminDashboard();
	const dashboard = dashboardQuery.data?.data;

	return (
		<PageLayout
			title="Painel"
			description="A fila de análise, a carga da equipe e o que espera por você."
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
				<DashboardLayout
					band={
						<DashboardBand
							title="Fila de análise hoje"
							tiles={[
								{
									label: "Em análise",
									value: dashboard && padCount(dashboard.projects.underReview),
								},
								{
									label: "Sem analista",
									value: dashboard && padCount(dashboard.queue.unassigned),
								},
								{
									label: "Prazo até 3 dias",
									value: dashboard && padCount(dashboard.queue.dueIn3Days),
								},
								{
									label: "Atrasados",
									value: dashboard && padCount(dashboard.queue.overdue),
								},
							]}
						/>
					}
					main={
						<>
							<IndicatorList
								title="Carga por Analista"
								caption="Em análise"
								items={dashboard?.queue.byReviewer.map(
									({ id, name, active, underReview }) => ({
										key: id,
										label: active ? name : `${name} (Inativo)`,
										value: `${padCount(underReview)} ${plural(underReview)}`,
									}),
								)}
								emptyMessage="Nenhum analista cadastrado."
							/>
							<IndicatorList
								title="Usuários"
								items={
									dashboard && [
										{
											key: "users",
											label: usersLink(`${userRolePluralLabels.user} ativos`, {
												role: "user",
												status: "active",
											}),
											value: padCount(dashboard.users.activeByRole.user ?? 0),
										},
										{
											key: "reviewers",
											label: usersLink(
												`${userRolePluralLabels.reviewer} ativos`,
												{ role: "reviewer", status: "active" },
											),
											value: padCount(
												dashboard.users.activeByRole.reviewer ?? 0,
											),
										},
										{
											key: "admins",
											label: usersLink(`${userRolePluralLabels.admin} ativos`, {
												role: "admin",
												status: "active",
											}),
											value: padCount(dashboard.users.activeByRole.admin ?? 0),
										},
										{
											key: "inactive",
											label: usersLink("Contas inativas", {
												status: "inactive",
											}),
											value: padCount(dashboard.users.inactive),
										},
									]
								}
								emptyMessage="Nenhum usuário cadastrado."
							/>
						</>
					}
					aside={<AdminActionList dashboard={dashboard} />}
				/>
			)}
		</PageLayout>
	);
};
