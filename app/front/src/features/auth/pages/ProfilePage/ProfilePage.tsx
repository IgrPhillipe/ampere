import { ControlledInput } from "@components/form";
import { Button } from "@components/ui/button";
import { formatPhone, useZodForm } from "@features/shared";
import { useGetProfile, useUpdateProfile } from "@services/users";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { ChangePasswordDialog } from "../../components/ChangePasswordDialog";
import { type ProfileFormValues, profileSchema } from "../../schemas";

export const ProfilePage = () => {
	const { data: profileResponse, isLoading } = useGetProfile();
	const { mutate: update, isPending: isUpdating } = useUpdateProfile();
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

	const profile = profileResponse?.data;

	const form = useZodForm(profileSchema, {
		name: "",
		email: "",
		company: "",
		phone: "",
		crea: "",
		creaState: "",
	});

	useEffect(() => {
		if (profile) {
			form.reset({
				name: profile.name,
				email: profile.email,
				company: profile.company ?? "",
				phone: profile.phone ? formatPhone(profile.phone) : "",
				crea: profile.crea ?? "",
				creaState: profile.creaState ?? "",
			});
		}
	}, [profile, form]);

	const onSubmit = (values: ProfileFormValues) => {
		update({
			name: values.name,
			company: values.company || null,
			phone: values.phone || null,
			crea: values.crea,
			creaState: values.creaState.toUpperCase(),
		});
	};

	const onDiscard = () => {
		if (profile) {
			form.reset({
				name: profile.name,
				email: profile.email,
				company: profile.company ?? "",
				phone: profile.phone ? formatPhone(profile.phone) : "",
				crea: profile.crea ?? "",
				creaState: profile.creaState ?? "",
			});
		}
	};

	const currentName = form.watch("name") || profile?.name || "";
	const currentCrea = form.watch("crea") || profile?.crea || "";
	const currentCreaState = (
		form.watch("creaState") ||
		profile?.creaState ||
		""
	).toUpperCase();

	const technicalResponsiblePreview =
		currentCrea && currentCreaState
			? `${currentName} · CREA-${currentCreaState} ${currentCrea}`
			: currentName
				? `${currentName} · CREA não informado`
				: "Não informado";

	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
			<main className="mx-auto flex w-full max-w-page flex-1 flex-col px-gutter py-8 md:px-gutter-md">
				<p className="font-mono text-xs font-medium tracking-[0.15em] text-[#7A7A7A] uppercase">
					MINHA CONTA
				</p>

				<h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111111]">
					Meu perfil
				</h1>

				<div className="mt-8 grid flex-1 grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_1px_380px]">
					{/* Left column: Profile Form */}
					<form
						id="profile-form"
						noValidate
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-10"
					>
						{/* Seção 1: Dados pessoais */}
						<section aria-labelledby="dados-pessoais-titulo">
							<h2
								id="dados-pessoais-titulo"
								className="border-b-2 border-[#222222] pb-2 text-lg font-medium text-[#111111]"
							>
								Dados pessoais
							</h2>

							<div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
								<ControlledInput
									control={form.control}
									name="name"
									label="NOME COMPLETO"
									required
									placeholder="Seu nome completo"
								/>

								<ControlledInput
									control={form.control}
									name="company"
									label="EMPRESA (OPCIONAL)"
									placeholder="Nome da sua empresa"
								/>

								<ControlledInput
									control={form.control}
									name="email"
									label="E-MAIL"
									type="email"
									required
									disabled
									title="O e-mail não pode ser alterado"
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
						</section>

						{/* Seção 2: Registro profissional */}
						<section aria-labelledby="registro-profissional-titulo">
							<h2
								id="registro-profissional-titulo"
								className="border-b-2 border-[#222222] pb-2 text-lg font-medium text-[#111111]"
							>
								Registro profissional
							</h2>

							<div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
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

							<div className="mt-8 flex flex-col gap-1.5 border-b border-[#E0DED9] pb-4">
								<span className="font-mono text-[11px] tracking-wider text-[#7A7A7A] uppercase">
									RESPONSÁVEL TÉCNICO · PREENCHIDO NO CARIMBO E NO MEMORIAL
								</span>
								<p className="text-base font-medium text-[#111111]">
									{technicalResponsiblePreview}
								</p>
							</div>
						</section>
					</form>

					{/* Vertical separator */}
					<div
						aria-hidden="true"
						className="hidden w-px bg-[#E0DED9] lg:block"
					/>

					{/* Right column: Info & Security */}
					<aside className="flex flex-col gap-10">
						{/* Notificações no sino */}
						<section aria-labelledby="notificacoes-titulo">
							<h2
								id="notificacoes-titulo"
								className="border-b-2 border-[#222222] pb-2 text-lg font-medium text-[#111111]"
							>
								Notificações no sino
							</h2>

							<ul className="mt-4 flex flex-col divide-y divide-[#E0DED9] text-sm">
								<li className="py-3.5">
									<strong className="block font-semibold text-[#111111]">
										Projeto aprovado
									</strong>
									<span className="text-[#555555]">
										Com a data de validade da aprovação (36 meses).
									</span>
								</li>

								<li className="py-3.5">
									<strong className="block font-semibold text-[#111111]">
										Projeto reprovado
									</strong>
									<span className="text-[#555555]">
										Com o número de apontamentos; abre a correção.
									</span>
								</li>

								<li className="py-3.5">
									<strong className="block font-semibold text-[#111111]">
										Apontamento reaberto na reanálise
									</strong>
									<span className="text-[#555555]">
										Quando o analista não aceita a correção ou a contestação.
									</span>
								</li>

								<li className="py-3.5">
									<strong className="block font-semibold text-[#111111]">
										Aprovação perto de expirar
									</strong>
									<span className="text-[#555555]">
										30 dias antes do fim da validade. O sistema não envia
										e-mail.
									</span>
								</li>
							</ul>
						</section>

						{/* Segurança */}
						<section aria-labelledby="seguranca-titulo">
							<h2
								id="seguranca-titulo"
								className="border-b-2 border-[#222222] pb-2 text-lg font-medium text-[#111111]"
							>
								Segurança
							</h2>

							<div className="mt-4 flex flex-col gap-3 text-sm">
								<p className="text-[#555555]">
									Sua senha protege o acesso ao portal e a emissão de projetos.
								</p>

								<button
									type="button"
									onClick={() => setPasswordDialogOpen(true)}
									className="group inline-flex items-center gap-1 self-start font-medium text-[#111111] underline hover:text-[#006C3B]"
								>
									<span>Alterar senha</span>
									<ArrowRight
										aria-hidden="true"
										className="size-4 transition-transform group-hover:translate-x-0.5"
									/>
								</button>
							</div>
						</section>
					</aside>
				</div>
			</main>

			{/* Fixed Bottom Bar */}
			<footer className="sticky bottom-0 border-t border-[#E0DED9] bg-white py-4 shadow-sm">
				<div className="mx-auto flex max-w-page items-center justify-end gap-3 px-gutter md:px-gutter-md">
					<Button
						type="button"
						variant="outline"
						onClick={onDiscard}
						disabled={isLoading || isUpdating}
						className="border-[#CCCCCC] bg-transparent text-[#111111] hover:bg-[#F5F5F5]"
					>
						Descartar
					</Button>

					<Button
						type="submit"
						form="profile-form"
						disabled={isLoading || isUpdating}
						className="rounded-[4px] bg-[#006C3B] px-6 text-white hover:bg-[#005B31]"
					>
						{isUpdating ? "Salvando alterações..." : "Salvar alterações"}
					</Button>
				</div>
			</footer>

			<ChangePasswordDialog
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}
			/>
		</div>
	);
};
