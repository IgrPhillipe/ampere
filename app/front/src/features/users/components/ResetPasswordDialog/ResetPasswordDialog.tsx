import { ConfirmDialog } from "@components/ConfirmDialog";
import type { ManagedUser } from "@services/users";

interface ResetPasswordDialogProps {
	user: ManagedUser | null;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (user: ManagedUser) => void;
}

export const ResetPasswordDialog = ({
	user,
	isPending,
	onOpenChange,
	onConfirm,
}: ResetPasswordDialogProps) => (
	<ConfirmDialog
		open={user !== null}
		title="Redefinir Senha"
		description={`A senha atual de ${user?.name} deixa de valer. O sistema gera uma senha temporária, exibida uma única vez, e a troca é obrigatória no próximo login.`}
		confirmLabel="Redefinir Senha"
		pendingLabel="Redefinindo..."
		isPending={isPending}
		onOpenChange={onOpenChange}
		onConfirm={() => {
			if (user) onConfirm(user);
		}}
	/>
);
