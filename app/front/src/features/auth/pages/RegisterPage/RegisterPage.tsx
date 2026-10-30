import { ControlledInput, FormActions } from "@components/form";
import { Button } from "@components/ui/button";
import { formatPhone, useZodForm } from "@features/shared";
import { useRegister } from "@services/auth";
import { Link } from "@tanstack/react-router";
import type { HTTPError } from "ky";

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

	const onSubmit = (values: RegisterFormValues) => {
		registerUser(
			{
				name: values.name,
				email: values.email,
				password: values.password,
				crea: values.crea,
				creaState: values.creaState.toUpperCase(),
				company: values.company?.trim() ? values.company.trim() : undefined,
				phone: values.phone,
			},
			{
				onError: async (error) => {
					const httpError = error as HTTPError;
					if (httpError.response?.status === 409) {
						form.setError("email", {
							type: "manual",
							message: "Já existe uma conta com este e-mail.",
						});
					}
				},
			},
		);
	};

	return (
		<main className="flex min-h-svh items-center justify-center bg-[#F2F1ED] p-4 sm:p-6 md:p-8">
			<div className="w-full max-w-[560px] rounded-xs border border-border bg-card p-6 shadow-xs sm:p-10">
				<p className="font-mono text-xs font-medium tracking-[0.15em] text-[#7A7A7A] uppercase">
					ACESSO AO PORTAL
				</p>

				<h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]">
					Criar conta
				</h1>

				<p className="mt-2 text-sm leading-relaxed text-[#555555]">
					A conta é criada com o papel de projetista. Seu nome e o CREA
					preenchem o responsável técnico no carimbo do projeto e no memorial.
				</p>

				<hr className="mt-5 mb-8 border-t-2 border-[#222222]" />

				<form
					noValidate
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-6"
				>
					<ControlledInput
						control={form.control}
						name="name"
						label="NOME COMPLETO"
						required
						placeholder="Digite seu nome completo"
					/>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<ControlledInput
							control={form.control}
							name="crea"
							label="NÚMERO DO CREA"
							required
							placeholder="Ex.: 1684D"
						/>

						<ControlledInput
							control={form.control}
							name="creaState"
							label="UF DO CREA"
							required
							maxLength={2}
							placeholder="PE"
							className="uppercase"
						/>
					</div>

					<ControlledInput
						control={form.control}
						name="email"
						label="E-MAIL"
						type="email"
						required
						placeholder="nome@exemplo.com.br"
					/>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<ControlledInput
							control={form.control}
							name="company"
							label="EMPRESA (OPCIONAL)"
							placeholder="Nome da sua empresa"
						/>

						<ControlledInput
							control={form.control}
							name="phone"
							label="TELEFONE"
							type="tel"
							required
							format={formatPhone}
							placeholder="(81) 98821-4470"
						/>
					</div>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<ControlledInput
							control={form.control}
							name="password"
							label="SENHA"
							type="password"
							required
							autoComplete="new-password"
						/>

						<ControlledInput
							control={form.control}
							name="confirmPassword"
							label="CONFIRMAR SENHA"
							type="password"
							required
							autoComplete="new-password"
						/>
					</div>

					<div className="flex items-start gap-2 pt-2 text-xs leading-relaxed text-[#7A7A7A]">
						<span
							aria-hidden="true"
							className="mt-1 size-1.5 shrink-0 rounded-full bg-[#888888]"
						/>
						<span>
							Campos com * são obrigatórios. A senha precisa de 8 caracteres,
							com letra e número. Analistas não se cadastram aqui: são criados
							pelo administrador.
						</span>
					</div>

					<FormActions className="mt-2 flex flex-row items-center gap-4">
						<Button
							type="submit"
							disabled={isPending}
							className="rounded-[4px] bg-[#006C3B] px-6 text-white hover:bg-[#005B31]"
						>
							{isPending ? "Criando conta..." : "Criar conta"}
						</Button>

						<Link
							to="/entrar"
							className="text-sm font-medium text-[#111111] underline hover:text-[#006C3B]"
						>
							Já tenho conta
						</Link>
					</FormActions>
				</form>
			</div>
		</main>
	);
};
