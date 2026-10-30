import { ControlledInput, FormActions } from "@components/form";
import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { formatPhone, setApiFieldErrors, useZodForm } from "@features/shared";
import { useRegister } from "@services/auth";
import { Link } from "@tanstack/react-router";

import { type RegisterFormValues, registerSchema } from "../../schemas";

export const RegisterPage = () => {
	const form = useZodForm(registerSchema, {
		name: "",
		crea: "",
		creaState: "",
		email: "",
		company: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});

	const { mutate: registerUser, isPending } = useRegister();

	const onSubmit = ({
		confirmPassword,
		company,
		...values
	}: RegisterFormValues) =>
		registerUser(
			{ ...values, company: company || undefined },
			{
				onError: (error) => setApiFieldErrors(form, error, { 409: "email" }),
			},
		);

	return (
		<main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
			<Card className="w-full max-w-xl">
				<CardHeader>
					<CardTitle className="text-2xl">Criar Conta</CardTitle>

					<CardDescription>
						A conta é criada com o papel de projetista. Seu nome e o CREA
						identificam o responsável técnico no carimbo do projeto e no
						memorial.
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
							name="name"
							label="Nome completo"
							required
							autoComplete="name"
							placeholder="Digite seu nome completo"
						/>

						<div className="grid gap-4 sm:grid-cols-2">
							<ControlledInput
								control={form.control}
								name="crea"
								label="Número do CREA"
								required
								placeholder="Ex.: 1684D"
							/>

							<ControlledInput
								control={form.control}
								name="creaState"
								label="UF do CREA"
								required
								maxLength={2}
								placeholder="PE"
								className="uppercase"
							/>
						</div>

						<ControlledInput
							control={form.control}
							name="email"
							label="E-mail"
							type="email"
							required
							autoComplete="email"
							placeholder="voce@exemplo.com"
						/>

						<div className="grid gap-4 sm:grid-cols-2">
							<ControlledInput
								control={form.control}
								name="company"
								label="Empresa"
								autoComplete="organization"
								placeholder="Opcional"
							/>

							<ControlledInput
								control={form.control}
								name="phone"
								label="Telefone"
								type="tel"
								required
								autoComplete="tel"
								format={formatPhone}
								placeholder="(81) 98821-4470"
							/>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<ControlledInput
								control={form.control}
								name="password"
								label="Senha"
								type="password"
								required
								autoComplete="new-password"
								description="Ao menos 8 caracteres, com letra e número."
							/>

							<ControlledInput
								control={form.control}
								name="confirmPassword"
								label="Confirmar senha"
								type="password"
								required
								autoComplete="new-password"
							/>
						</div>

						<FormActions>
							<Button type="submit" disabled={isPending} className="w-full">
								{isPending ? "Criando conta..." : "Criar Conta"}
							</Button>
						</FormActions>

						<p className="mt-2 text-center text-sm text-muted-foreground">
							Já tem uma conta?{" "}
							<Link
								to="/entrar"
								className="font-medium text-primary hover:underline"
							>
								Entrar
							</Link>
						</p>
					</form>
				</CardContent>
			</Card>
		</main>
	);
};
