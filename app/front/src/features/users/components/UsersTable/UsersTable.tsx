import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import { useAuthStore } from "@features/shared";
import { cn } from "@lib/utils";
import type { ManagedUser } from "@services/users";
import { useMemo } from "react";

import type { UserRowActionHandlers } from "../UserRowActions";
import { UserCards } from "./UserCards";
import { createUserColumns, type UserColumnId } from "./user-columns";

const userColumnClassNames = {
	role: "w-40",
	status: "w-56",
	lastLoginAt: "hidden lg:table-cell lg:w-48",
	action: "w-16",
} satisfies Partial<Record<UserColumnId, string>>;

interface UsersTableProps {
	users: ManagedUser[];
	isLoading?: boolean;
	actions?: UserRowActionHandlers;
	/** Present while a search or filter narrows the list. */
	onClearFilters?: () => void;
	/** Present when the list is empty without filters. */
	onCreate?: () => void;
	className?: string;
}

export const UsersTable = ({
	users,
	isLoading = false,
	actions,
	onClearFilters,
	onCreate,
	className,
}: UsersTableProps) => {
	const currentUserId = useAuthStore((state) => state.user?.id);
	const columns = useMemo(
		() => createUserColumns(currentUserId, actions),
		[currentUserId, actions],
	);

	if (isLoading) return <SkeletonTable columns={5} />;

	if (users.length === 0 && onClearFilters) {
		return (
			<EmptyState
				title="Nenhum usuário encontrado para os critérios informados"
				description="Revise a busca e os filtros, ou limpe os filtros para ver todos os usuários."
				action={
					<Button type="button" variant="outline" onClick={onClearFilters}>
						Limpar Filtros
					</Button>
				}
			/>
		);
	}

	if (users.length === 0) {
		return (
			<EmptyState
				title="Nenhum usuário cadastrado"
				description="Crie as contas de projetistas, analistas e administradores."
				action={
					onCreate ? (
						<Button type="button" onClick={onCreate}>
							Novo Usuário
						</Button>
					) : undefined
				}
			/>
		);
	}

	return (
		<>
			<UserCards
				users={users}
				currentUserId={currentUserId}
				actions={actions}
				className={cn("md:hidden", className)}
			/>

			<DataTable<ManagedUser, UserColumnId>
				columns={columns}
				data={users}
				columnClassNames={userColumnClassNames}
				onRowClick={actions?.onEdit}
				className={cn("hidden md:block", className)}
			/>
		</>
	);
};
