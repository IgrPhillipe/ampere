import { FormActions } from "@components/form";
import { Button } from "@components/ui/button";
import { useAuthStore } from "@features/shared";
import { getRoleHomePath } from "@lib/route-guard";
import { useLogout } from "@services/auth";
import { useNavigate } from "@tanstack/react-router";

import { AuthLayout } from "../../components/AuthLayout";
import {
	ChangePasswordForm,
	useChangePasswordForm,
} from "../../components/ChangePasswordForm";

interface ChangePasswordPageProps {
	/** Route to return to after the change, taken from `?redirect=`. */
	redirectTo?: string;
}

export const ChangePasswordPage = ({ redirectTo }: ChangePasswordPageProps) => {
	const navigate = useNavigate();
	const logout = useLogout();
	const updateUser = useAuthStore((state) => state.updateUser);
	const role = useAuthStore((state) => state.user?.role);

	const { form, isPending, submit } = useChangePasswordForm({
		onSuccess: () => {
			updateUser({ mustChangePassword: false });
			void navigate({
				to: redirectTo ?? (role ? getRoleHomePath(role) : "/"),
			});
		},
	});

	return (
		<AuthLayout
			title="Troca de Senha"
			description="Sua senha é temporária. Crie uma nova senha para continuar."
			note="A nova senha precisa de ao menos 8 caracteres, com letra e número."
		>
			<ChangePasswordForm
				form={form}
				onSubmit={submit}
				currentPasswordLabel="Senha temporária"
			>
				<FormActions align="start">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Salvando..." : "Salvar Nova Senha"}
					</Button>

					<Button
						type="button"
						variant="link"
						className="h-auto px-0 underline"
						disabled={isPending}
						onClick={logout}
					>
						Sair
					</Button>
				</FormActions>
			</ChangePasswordForm>
		</AuthLayout>
	);
};
