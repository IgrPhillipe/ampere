import { ConfirmDialog } from "@components/ConfirmDialog";
import type { ManagedUser } from "@services/users";

import { useRetainedValue } from "../../hooks";

interface UserStatusDialogProps {
	user: ManagedUser | null;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (user: ManagedUser) => void;
}

export const UserStatusDialog = ({
	user,
	isPending,
	onOpenChange,
	onConfirm,
}: UserStatusDialogProps) => {
	const shownUser = useRetainedValue(user);
	const deactivating = shownUser?.active ?? false;

	return (
		<ConfirmDialog
			open={user !== null}
			title={deactivating ? "Desativar Usuário" : "Reativar Usuário"}
			description={
				deactivating
					? `${shownUser?.name} não poderá mais entrar no sistema, e a sessão aberta é encerrada no próximo acesso. Os projetos e as análises da conta são mantidos.`
					: `${shownUser?.name} volta a entrar no sistema com a senha atual.`
			}
			confirmLabel={deactivating ? "Desativar" : "Reativar"}
			pendingLabel={deactivating ? "Desativando..." : "Reativando..."}
			destructive={deactivating}
			isPending={isPending}
			onOpenChange={onOpenChange}
			onConfirm={() => {
				if (user) onConfirm(user);
			}}
		/>
	);
};
