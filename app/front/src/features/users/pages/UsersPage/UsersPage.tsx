import { EmptyState } from "@components/EmptyState";
import { FilterMenu } from "@components/FilterMenu";
import { ListToolbar } from "@components/ListToolbar";
import { PageLayout } from "@components/layout";
import { Pagination } from "@components/Pagination";
import { SearchInput } from "@components/SearchInput";
import { Button } from "@components/ui/button";
import { userRoleSchema } from "@services/auth";
import { useGetUserList } from "@services/users";
import { CircleAlert } from "lucide-react";

import { UserActiveFilters, UsersTable } from "../../components";
import {
	USER_STATUSES,
	userRoleLabels,
	userStatusLabels,
} from "../../constants";
import { useUserFilters } from "../../hooks";

const roleOptions = userRoleSchema.options.map((value) => ({
	value,
	label: userRoleLabels[value],
}));

const statusOptions = USER_STATUSES.map((value) => ({
	value,
	label: userStatusLabels[value],
}));

export const UsersPage = () => {
	const filters = useUserFilters();
	const usersQuery = useGetUserList(filters.params);
	const pagination = usersQuery.data?.pagination;

	return (
		<PageLayout
			title="Usuários"
			description="Contas de projetistas, analistas e administradores. O sistema não envia e-mail: repasse a senha temporária ao usuário."
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<section
				className="flex flex-1 flex-col bg-card"
				aria-label="Usuários do sistema"
			>
				<ListToolbar
					filters={null}
					search={
						<SearchInput
							value={filters.search}
							onValueChange={filters.setSearch}
							placeholder="Buscar por nome ou e-mail"
							label="Buscar usuários"
						/>
					}
					refinements={
						<>
							<FilterMenu
								label="Papel"
								allLabel="Todos"
								options={roleOptions}
								value={filters.role}
								onValueChange={filters.setRole}
							/>
							<FilterMenu
								label="Situação"
								allLabel="Todas"
								options={statusOptions}
								value={filters.status}
								onValueChange={filters.setStatus}
							/>
						</>
					}
					activeFilters={<UserActiveFilters filters={filters} />}
				/>

				<div className="flex-1 px-gutter py-4 md:px-gutter-md md:py-5">
					{usersQuery.isError ? (
						<EmptyState
							title="Não foi possível carregar os usuários"
							description="Verifique sua conexão e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => void usersQuery.refetch()}
								>
									Tentar Novamente
								</Button>
							}
						/>
					) : (
						<UsersTable
							users={usersQuery.data?.data ?? []}
							isLoading={usersQuery.isPending}
							onClearFilters={
								filters.hasActiveFilters ? filters.clearFilters : undefined
							}
						/>
					)}
				</div>

				{pagination && !usersQuery.isError ? (
					<Pagination
						page={pagination.page}
						pageSize={pagination.pageSize}
						total={pagination.total}
						onPageChange={filters.setPage}
						itemLabel="usuários"
					/>
				) : null}
			</section>
		</PageLayout>
	);
};
