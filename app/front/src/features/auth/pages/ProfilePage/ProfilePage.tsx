import { EmptyState } from "@components/EmptyState";
import { ControlledInput, FormActions } from "@components/form";
import { InlineActionButton } from "@components/InlineActionButton";
import { PageLayout } from "@components/layout";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import {
	formatPhone,
	setApiFieldErrors,
	useAuthStore,
	useZodForm,
} from "@features/shared";
import {
	type ProfileResponse,
	useGetProfile,
	useUpdateProfile,
} from "@services/users";
import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormState, useWatch } from "react-hook-form";

import { ChangePasswordDialog } from "../../components";
import {
	designerProfileSchema,
	type ProfileFormValues,
	profileSchema,
} from "../../schemas";

const formValuesOf = (profile: ProfileResponse): ProfileFormValues => ({
	name: profile.name,
	email: profile.email,
	company: profile.company ?? "",
	phone: profile.phone ? formatPhone(profile.phone) : "",
	crea: profile.crea ?? "",
	creaState: profile.creaState ?? "",
});

/** Same text as the "Responsável técnico" cell of the project header. */
const technicalResponsibleOf = (
	name: string,
	crea: string,
	creaState: string,
) => {
	const person = name.trim() || "Nome não informado";
	const number = crea.trim();
	const state = creaState.trim().toUpperCase();

	if (!number) return `${person}, sem CREA`;

	return `${person}, CREA ${state ? `${number}/${state}` : number}`;
};

export const ProfilePage = () => {
	const profileQuery = useGetProfile();
	const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

	const profile = profileQuery.data?.data;
	const isDesigner = useAuthStore((state) => state.user?.role === "user");

	const form = useZodForm(isDesigner ? designerProfileSchema : profileSchema, {
		name: "",
		email: "",
		company: "",
		phone: "",
		crea: "",
		creaState: "",
	});
	const { isDirty } = useFormState({ control: form.control });

	useEffect(() => {
		if (profile) {
			form.reset(formValuesOf(profile));
		}
	}, [profile, form]);

	const [name, crea, creaState] = useWatch({
		control: form.control,
		name: ["name", "crea", "creaState"],
	});

	const onSubmit = ({ email, company, ...values }: ProfileFormValues) =>
		updateProfile(
			{ ...values, company: company || null },
			{ onError: (error) => setApiFieldErrors(form, error) },
		);

	const onDiscard = () => {
		if (profile) {
			form.reset(formValuesOf(profile));
		}
	};

	if (profileQuery.isError) {
		return (
			<PageLayout eyebrow="Minha conta" title="Meu Perfil">
				<EmptyState
					title="Não foi possível carregar o perfil"
					description="Verifique sua conexão e tente novamente."
					icon={CircleAlert}
					action={
						<Button
							type="button"
							variant="outline"
							onClick={() => void profileQuery.refetch()}
						>
							Tentar Novamente
						</Button>
					}
				/>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			bleed
			eyebrow="Minha conta"
			title="Meu Perfil"
			className="mx-auto w-full max-w-page gap-9 pb-0 md:gap-9 md:pb-0"
		>
			<form
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-1 flex-col border-t border-border"
			>
				<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_440px]">
					<fieldset
						disabled={profileQuery.isLoading || isUpdating}
						className="flex min-w-0 flex-col gap-9.5 px-4 py-9 md:px-10"
					>
						<section aria-labelledby="dados-pessoais">
							<SectionHeading id="dados-pessoais">
								Dados Pessoais
							</SectionHeading>

							<div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
								<ControlledInput
									control={form.control}
									name="name"
									label="Nome completo"
									required
									autoComplete="name"
								/>

								<ControlledInput
									control={form.control}
									name="company"
									label="Empresa (opcional)"
									autoComplete="organization"
								/>

								<ControlledInput
									control={form.control}
									name="email"
									label="E-mail"
									type="email"
									disabled
									description="O e-mail não pode ser alterado."
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
						</section>

						{isDesigner ? (
							<section aria-labelledby="registro-profissional">
								<SectionHeading id="registro-profissional">
									Registro Profissional
								</SectionHeading>

								<div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
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

								<div className="mt-5 flex flex-col gap-1.5 border-b border-border pb-3">
									<p className="font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase">
										Responsável técnico no carimbo e no memorial
									</p>

									<p className="text-base text-muted-foreground">
										{technicalResponsibleOf(name, crea, creaState)}
									</p>
								</div>
							</section>
						) : null}
					</fieldset>

					<aside className="border-t border-border px-4 py-9 md:px-10 lg:border-t-0 lg:border-l">
						<section aria-labelledby="seguranca">
							<SectionHeading id="seguranca">Segurança</SectionHeading>

							<p className="mt-5 text-sm text-muted-foreground">
								Sua senha protege o acesso ao portal e o envio de projetos.
							</p>

							<InlineActionButton
								className="mt-3 underline"
								onClick={() => setPasswordDialogOpen(true)}
							>
								Alterar Senha
							</InlineActionButton>
						</section>
					</aside>
				</div>

				<FormActions className="border-t border-border px-4 py-4 md:px-10">
					<Button
						type="button"
						variant="outline"
						disabled={!isDirty || isUpdating}
						onClick={onDiscard}
					>
						Descartar
					</Button>

					<Button type="submit" disabled={!isDirty || isUpdating}>
						{isUpdating ? "Salvando..." : "Salvar Alterações"}
					</Button>
				</FormActions>
			</form>

			<ChangePasswordDialog
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}
			/>
		</PageLayout>
	);
};
