import { ControlledInput, FormActions } from "@components/form";
import { Button } from "@components/ui/button";
import { formatPhone, setApiFieldErrors, useZodForm } from "@features/shared";
import { useRegister } from "@services/auth";
import { Link } from "@tanstack/react-router";

import { AuthLayout } from "../../components/AuthLayout";
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
		<AuthLayout
			title="Criar Conta"
			description="A conta é criada com o papel de projetista. Seu nome e o CREA identificam o responsável técnico no carimbo do projeto e no memorial."
			note="Campos com * são obrigatórios. A senha precisa de ao menos 8 caracteres, com letra e número. Analistas não se cadastram aqui: são criados pelo gestor."
		>
			<form
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-5"
			>
				<ControlledInput
					control={form.control}
					name="name"
					label="Nome completo"
					required
					autoComplete="name"
					placeholder="Digite seu nome completo"
				/>

				<div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
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

				<div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
					<ControlledInput
						control={form.control}
						name="company"
						label="Empresa (opcional)"
						autoComplete="organization"
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

				<div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
					<ControlledInput
						control={form.control}
						name="password"
						label="Senha"
						type="password"
						required
						autoComplete="new-password"
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

				<FormActions align="start">
					<Button type="submit" disabled={isPending}>
						{isPending ? "Criando conta..." : "Criar Conta"}
					</Button>

					<Button
						variant="link"
						nativeButton={false}
						className="h-auto px-0 underline"
						render={<Link to="/entrar" />}
					>
						Já Tenho Conta
					</Button>
				</FormActions>
			</form>
		</AuthLayout>
	);
};
