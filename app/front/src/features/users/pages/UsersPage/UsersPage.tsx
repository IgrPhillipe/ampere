import { EmptyState } from "@components/EmptyState";
import { FilterMenu } from "@components/FilterMenu";
import { ListToolbar } from "@components/ListToolbar";
import { PageLayout } from "@components/layout";
import { Pagination } from "@components/Pagination";
import { SearchInput } from "@components/SearchInput";
import { Button } from "@components/ui/button";
import { userRoleSchema } from "@services/auth";
import {
	type ManagedUser,
	type TemporaryAccess,
	useGetUserList,
	useResetUserPassword,
	useToggleUserActive,
} from "@services/users";
import { CircleAlert, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import {
	ResetPasswordDialog,
	TemporaryPasswordDialog,
	UserActiveFilters,
	UserFormDialog,
	type UserRowActionHandlers,
	UserStatusDialog,
	UsersTable,
} from "../../components";
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
	const [isFormOpen, setFormOpen] = useState(false);
	// Kept after closing so the dialog does not swap content mid-animation.
	const [userToEdit, setUserToEdit] = useState<ManagedUser | null>(null);
	const [userToToggle, setUserToToggle] = useState<ManagedUser | null>(null);
	const [userToReset, setUserToReset] = useState<ManagedUser | null>(null);
	const [temporaryAccess, setTemporaryAccess] =
		useState<TemporaryAccess | null>(null);
	const toggleActive = useToggleUserActive();
	const resetPassword = useResetUserPassword();

	const openNewUser = () => {
		setUserToEdit(null);
		setFormOpen(true);
	};

	const actions = useMemo<UserRowActionHandlers>(
		() => ({
			onEdit: (user) => {
				setUserToEdit(user);
				setFormOpen(true);
			},
			onResetPassword: setUserToReset,
			onToggleActive: setUserToToggle,
		}),
		[],
	);

	const confirmToggle = (user: ManagedUser) =>
		toggleActive.mutate(user, { onSuccess: () => setUserToToggle(null) });

	const confirmReset = (user: ManagedUser) =>
		resetPassword.mutate(user.id, {
			onSuccess: ({ data }) => {
				setUserToReset(null);
				setTemporaryAccess(data);
			},
		});

	return (
		<PageLayout
			title="Usuários"
			description="Contas de projetistas, analistas e administradores. O sistema não envia e-mail: repasse a senha temporária ao usuário."
			bleed
			actions={
				<Button type="button" size="sm" onClick={openNewUser}>
					<Plus aria-hidden="true" />
					Novo Usuário
				</Button>
			}
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
							actions={actions}
							onCreate={openNewUser}
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

			<UserFormDialog
				open={isFormOpen}
				user={userToEdit}
				onOpenChange={setFormOpen}
				onCreated={setTemporaryAccess}
			/>

			<UserStatusDialog
				user={userToToggle}
				isPending={toggleActive.isPending}
				onOpenChange={(open) => {
					if (!open) setUserToToggle(null);
				}}
				onConfirm={confirmToggle}
			/>

			<ResetPasswordDialog
				user={userToReset}
				isPending={resetPassword.isPending}
				onOpenChange={(open) => {
					if (!open) setUserToReset(null);
				}}
				onConfirm={confirmReset}
			/>

			<TemporaryPasswordDialog
				access={temporaryAccess}
				onClose={() => setTemporaryAccess(null)}
			/>
		</PageLayout>
	);
};
