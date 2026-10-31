import { Button } from "@components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import type { ManagedUser } from "@services/users";
import {
	EllipsisVertical,
	KeyRound,
	Pencil,
	UserCheck,
	UserX,
} from "lucide-react";

export interface UserRowActionHandlers {
	onEdit: (user: ManagedUser) => void;
	onResetPassword: (user: ManagedUser) => void;
	onToggleActive: (user: ManagedUser) => void;
}

interface UserRowActionsProps extends UserRowActionHandlers {
	user: ManagedUser;
	isCurrentUser: boolean;
}

export const UserRowActions = ({
	user,
	isCurrentUser,
	onEdit,
	onResetPassword,
	onToggleActive,
}: UserRowActionsProps) => (
	// The row opens the edit on click, and the portaled menu still bubbles to it.
	<div className="contents" onClick={(event) => event.stopPropagation()}>
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						aria-label={`Ações do usuário ${user.name}`}
					/>
				}
			>
				<EllipsisVertical aria-hidden="true" />
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => onEdit(user)}>
					<Pencil aria-hidden="true" />
					Editar
				</DropdownMenuItem>

				{/* The administrator changes their own password in "Meu Perfil". */}
				{isCurrentUser ? null : (
					<DropdownMenuItem onClick={() => onResetPassword(user)}>
						<KeyRound aria-hidden="true" />
						Redefinir Senha
					</DropdownMenuItem>
				)}

				{user.active && !isCurrentUser ? (
					<DropdownMenuItem
						variant="destructive"
						onClick={() => onToggleActive(user)}
					>
						<UserX aria-hidden="true" />
						Desativar
					</DropdownMenuItem>
				) : null}

				{user.active ? null : (
					<DropdownMenuItem onClick={() => onToggleActive(user)}>
						<UserCheck aria-hidden="true" />
						Reativar
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
);
