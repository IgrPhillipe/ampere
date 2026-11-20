import { ControlledInput, FormActions } from "@components/form";
import { Button } from "@components/ui/button";
import { useZodForm } from "@features/shared";
import { useLogin } from "@services/auth";
import { Link } from "@tanstack/react-router";

import { AuthLayout } from "../../components/AuthLayout";
import { type LoginFormValues, loginSchema } from "../../schemas";

interface LoginPageProps {
	/** Route to return to after signing in, taken from `?redirect=`. */
	redirectTo?: string;
}

export const LoginPage = ({ redirectTo }: LoginPageProps) => {
	const form = useZodForm(loginSchema, { email: "", password: "" });
	const { mutate: signIn, isPending } = useLogin({ redirectTo });

	const onSubmit = (values: LoginFormValues) => signIn(values);

	return (
		<AuthLayout
			title="Entrar"
			description="Acesse com as credenciais cadastradas."
			note="Projetistas criam a própria conta. Analistas e gestores recebem o acesso do gestor do portal."
		>
			<form
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-5"
			>
				<ControlledInput
					control={form.control}
					name="email"
					label="E-mail"
					type="email"
					autoComplete="email"
					placeholder="voce@exemplo.com"
				/>

				<ControlledInput
					control={form.control}
					name="password"
					label="Senha"
					type="password"
					autoComplete="current-password"
				/>

				<FormActions align="start">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Entrando..." : "Entrar"}
					</Button>

					<Button
						variant="link"
						nativeButton={false}
						className="h-auto px-0 underline"
						render={<Link to="/criar-conta" />}
					>
						Criar Conta
					</Button>
				</FormActions>
			</form>
		</AuthLayout>
	);
};
