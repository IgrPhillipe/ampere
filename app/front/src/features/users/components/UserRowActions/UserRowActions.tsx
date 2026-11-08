import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import type { ManagedUser } from "@services/users";

export interface UserRowActionHandlers {
	onEdit: (user: ManagedUser) => void;
	onResetPassword: (user: ManagedUser) => void;
	onToggleActive: (user: ManagedUser) => void;
}

interface UserRowActionsProps extends UserRowActionHandlers {
	user: ManagedUser;
	isCurrentUser: boolean;
	className?: string;
}

const linkClassName = "h-auto px-0 text-sm";

/** Visible text links of the Figma; the destructive one in dark orange. */
export const UserRowActions = ({
	user,
	isCurrentUser,
	onEdit,
	onResetPassword,
	onToggleActive,
	className,
}: UserRowActionsProps) => (
	// The row opens the edit on click; the links handle their own.
	<div
		className={cn("flex items-center justify-end gap-x-4 gap-y-1", className)}
		onClick={(event) => event.stopPropagation()}
		onKeyDown={(event) => event.stopPropagation()}
	>
		<Button
			type="button"
			variant="link"
			className={linkClassName}
			onClick={() => onEdit(user)}
		>
			Editar
		</Button>

		{/* The administrator changes their own password in "Meu Perfil". */}
		{isCurrentUser ? (
			<span className="text-sm text-faint-foreground">Conta própria</span>
		) : (
			<Button
				type="button"
				variant="link"
				className={linkClassName}
				onClick={() => onResetPassword(user)}
			>
				Redefinir Senha
			</Button>
		)}

		{user.active && !isCurrentUser ? (
			<Button
				type="button"
				variant="link"
				className={cn(linkClassName, "text-destructive")}
				onClick={() => onToggleActive(user)}
			>
				Desativar
			</Button>
		) : null}

		{user.active ? null : (
			<Button
				type="button"
				variant="link"
				className={linkClassName}
				onClick={() => onToggleActive(user)}
			>
				Reativar
			</Button>
		)}
	</div>
);
