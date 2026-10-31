import { createDataTableColumnHelper } from "@components/DataTable";
import type { ManagedUser } from "@services/users";

import { UserRoleBadge } from "../UserRoleBadge";
import { type UserRowActionHandlers, UserRowActions } from "../UserRowActions";
import { UserStatusBadge } from "../UserStatusBadge";
import { LastAccessCell } from "./LastAccessCell";
import { UserIdentity } from "./UserIdentity";

const columnHelper = createDataTableColumnHelper<ManagedUser>();

export type UserColumnId =
	| "name"
	| "role"
	| "status"
	| "lastLoginAt"
	| "action";

export const createUserColumns = (
	currentUserId: string | undefined,
	actions: UserRowActionHandlers | undefined,
) =>
	columnHelper.columns([
		columnHelper.accessor("name", {
			header: "Usuário",
			cell: ({ row }) => (
				<UserIdentity
					user={row.original}
					isCurrentUser={row.original.id === currentUserId}
				/>
			),
		}),
		columnHelper.accessor("role", {
			header: "Papel",
			cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
		}),
		columnHelper.accessor("active", {
			id: "status",
			header: "Situação",
			cell: ({ row }) => <UserStatusBadge user={row.original} />,
		}),
		columnHelper.accessor("lastLoginAt", {
			header: "Último acesso",
			cell: ({ row }) => <LastAccessCell value={row.original.lastLoginAt} />,
		}),
		...(actions
			? [
					columnHelper.display({
						id: "action",
						header: () => <span className="sr-only">Ações</span>,
						cell: ({ row }) => (
							<div className="flex justify-end">
								<UserRowActions
									user={row.original}
									isCurrentUser={row.original.id === currentUserId}
									{...actions}
								/>
							</div>
						),
					}),
				]
			: []),
	]);
