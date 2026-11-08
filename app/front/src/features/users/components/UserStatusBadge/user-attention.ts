import type { AttentionMessage } from "@components/AttentionIndicator";
import type { ManagedUser } from "@services/users";

export type UserState = Pick<ManagedUser, "active" | "mustChangePassword">;

/** A pending change only matters while the account can still sign in. */
export const hasTemporaryPassword = (user: UserState) =>
	user.active && user.mustChangePassword;

/** Inactive accounts and unchanged temporary passwords are the rows that ask for action. */
export const getUserAttention = (user: UserState): AttentionMessage | null => {
	if (!user.active) {
		return {
			severity: "warning",
			title: "Conta inativa",
			details: ["O usuário não consegue entrar no sistema"],
			action: "Reative a conta para devolver o acesso.",
		};
	}

	if (hasTemporaryPassword(user)) {
		return {
			severity: "warning",
			title: "Senha temporária",
			details: ["O usuário ainda não trocou a senha recebida"],
			action: "Confirme que a senha foi repassada.",
		};
	}

	return null;
};
