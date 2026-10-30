import { EmptyState } from "@components/EmptyState";
import { ControlledInput, FormActions } from "@components/form";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { formatPhone, setApiFieldErrors, useZodForm } from "@features/shared";
import {
	type ProfileResponse,
	useGetProfile,
	useUpdateProfile,
} from "@services/users";
import { ArrowRight, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormState, useWatch } from "react-hook-form";

import { ChangePasswordDialog } from "../../components";
import { type ProfileFormValues, profileSchema } from "../../schemas";

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

const sectionTitleClassName =
	"border-b border-foreground pb-3 text-lg font-semibold text-foreground";

export const ProfilePage = () => {
	const profileQuery = useGetProfile();
	const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
	const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

	const profile = profileQuery.data?.data;

	const form = useZodForm(profileSchema, {
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
			<PageLayout title="Meu Perfil">
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
			title="Meu Perfil"
			description="Seus dados e o registro profissional que identificam o responsável técnico dos seus projetos."
			className="mx-auto w-full max-w-page"
		>
			<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
				<form
					noValidate
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-10"
				>
					<fieldset
						disabled={profileQuery.isLoading || isUpdating}
						className="flex min-w-0 flex-col gap-10"
					>
						<section aria-labelledby="dados-pessoais">
							<h2 id="dados-pessoais" className={sectionTitleClassName}>
								Dados Pessoais
							</h2>

							<div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
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
									label="Empresa"
									autoComplete="organization"
									placeholder="Opcional"
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

						<section aria-labelledby="registro-profissional">
							<h2 id="registro-profissional" className={sectionTitleClassName}>
								Registro Profissional
							</h2>

							<div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
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

							<div className="mt-6 border-b border-border pb-4">
								<p className="text-xs tracking-wider text-muted-foreground uppercase">
									Responsável técnico no carimbo e no memorial
								</p>

								<p className="mt-1.5 font-medium text-foreground">
									{technicalResponsibleOf(name, crea, creaState)}
								</p>
							</div>
						</section>
					</fieldset>

					<FormActions>
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

				<aside>
					<section aria-labelledby="seguranca">
						<h2 id="seguranca" className={sectionTitleClassName}>
							Segurança
						</h2>

						<p className="mt-4 text-sm text-muted-foreground">
							Sua senha protege o acesso ao portal e o envio de projetos.
						</p>

						<Button
							type="button"
							variant="outline"
							className="mt-4"
							onClick={() => setPasswordDialogOpen(true)}
						>
							Alterar Senha
							<ArrowRight aria-hidden="true" />
						</Button>
					</section>
				</aside>
			</div>

			<ChangePasswordDialog
				open={passwordDialogOpen}
				onOpenChange={setPasswordDialogOpen}
			/>
		</PageLayout>
	);
};
