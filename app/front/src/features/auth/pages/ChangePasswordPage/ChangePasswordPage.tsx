import { FormActions } from "@components/form";
import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { useAuthStore } from "@features/shared";
import { getRoleHomePath } from "@lib/route-guard";
import { useLogout } from "@services/auth";
import { useNavigate } from "@tanstack/react-router";

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
		<main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Troca de Senha</CardTitle>

					<CardDescription>
						Sua senha é temporária. Crie uma nova senha para continuar, com ao
						menos 8 caracteres, letra e número.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<ChangePasswordForm
						form={form}
						onSubmit={submit}
						currentPasswordLabel="Senha temporária"
					>
						<FormActions>
							<Button
								type="button"
								variant="outline"
								disabled={isPending}
								onClick={logout}
							>
								Sair
							</Button>

							<Button type="submit" disabled={isPending}>
								{isPending ? "Salvando..." : "Salvar Nova Senha"}
							</Button>
						</FormActions>
					</ChangePasswordForm>
				</CardContent>
			</Card>
		</main>
	);
};
