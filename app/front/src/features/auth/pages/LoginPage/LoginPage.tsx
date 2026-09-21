import { ControlledInput, FormActions } from "@components/form";
import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { useZodForm } from "@features/shared";
import { useLogin } from "@services/auth";

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
		<main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle className="text-2xl">Entrar</CardTitle>

					<CardDescription>
						Acesse com as credenciais cadastradas.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						noValidate
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
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

						<FormActions>
							<Button type="submit" disabled={isPending} className="w-full">
								{isPending ? "Entrando..." : "Entrar"}
							</Button>
						</FormActions>
					</form>
				</CardContent>
			</Card>
		</main>
	);
};
