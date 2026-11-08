import { ConclusionField } from "@components/ConclusionField";
import { ControlledInput, ControlledSelect } from "@components/form";
import { Eyebrow, PageLayout } from "@components/layout";
import { SectionHeading } from "@components/SectionHeading";
import { Button } from "@components/ui/button";
import { formatPostalCode, useAuthStore, useZodForm } from "@features/shared";
import { calculationKeys } from "@services/calculation";
import { isConcessionState } from "@services/locations";
import { useGetFindingList } from "@services/project-review";
import {
	type ProjectDetail,
	useCreateProject,
	useGetProject,
	useUpdateProject,
} from "@services/projects";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useEffect } from "react";
import { useFormState } from "react-hook-form";

import {
	FindingBadge,
	ProjectAddressFields,
	ProjectBreadcrumb,
	ProjectOwnerField,
	StageFindingsNotice,
	StepFooter,
} from "../../components";
import {
	buildingTypeLabels,
	connectionTypeLabels,
	entranceStandardLabels,
	stageFindingsOf,
	voltageLabels,
} from "../../constants";
import { useProjectPermissions } from "../../hooks";
import {
	type ProjectCreationFormValues,
	projectCreationSchema,
} from "../../schemas";

/** The designer only counts while the administrator is choosing it, on creation. */
const progressSectionsOf = (
	withOwner: boolean,
): {
	title: string;
	fields: ReadonlyArray<keyof ProjectCreationFormValues>;
}[] => [
	{
		title: "Identificação",
		fields: [
			...(withOwner ? (["ownerId"] as const) : []),
			"name",
			"postalCode",
			"state",
			"municipality",
			"address",
			"floors",
		],
	},
	{
		title: "Parâmetros Técnicos",
		fields: ["buildingType", "voltage", "connectionType", "entranceStandard"],
	},
];

const pad = (value: number) => String(value).padStart(2, "0");

/** Alvo do `aria-describedby` do botao quando ele esta desabilitado. */
const progressCounterId = "projeto-preenchimento";

const isFilled = (value: unknown) =>
	value !== undefined && value !== null && value !== "" && !Number.isNaN(value);

const formValuesOf = (
	project: ProjectDetail,
): Partial<ProjectCreationFormValues> => ({
	name: project.name,
	postalCode: formatPostalCode(project.postalCode ?? ""),
	state: isConcessionState(project.state) ? project.state : undefined,
	municipality: project.municipality,
	address: project.address,
	buildingType: project.buildingType,
	floors: project.floors,
	voltage: project.voltage,
	connectionType: project.connectionType,
	entranceStandard: project.entranceStandard,
	ownerId: project.ownerId ?? undefined,
});

interface ProjectDataPageProps {
	/** Absent when creating a project. */
	projectId?: string;
}

export const ProjectDataPage = ({ projectId }: ProjectDataPageProps) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const createProject = useCreateProject();
	const updateProject = useUpdateProject();
	const projectQuery = useGetProject(projectId ?? "", {
		enabled: projectId !== undefined,
	});
	const project = projectQuery.data?.data;
	const findingsQuery = useGetFindingList(projectId ?? "", {
		enabled: project?.status === "REJECTED",
	});
	const stageFindings = stageFindingsOf(
		findingsQuery.data?.data,
		project,
		"PROJECT_DATA",
	);
	const { canEdit } = useProjectPermissions(project);
	const isAdmin = useAuthStore((state) => state.user?.role === "admin");
	const isEditable = projectId === undefined || canEdit;
	const choosesOwner = isAdmin && projectId === undefined;
	const isSaving = createProject.isPending || updateProject.isPending;

	const form = useZodForm(projectCreationSchema, {
		name: "",
		postalCode: "",
		state: undefined,
		municipality: "",
		address: "",
		buildingType: undefined,
		floors: undefined,
		voltage: undefined,
		connectionType: undefined,
		entranceStandard: undefined,
		ownerId: undefined,
	});

	useEffect(() => {
		if (project) {
			form.reset(formValuesOf(project));
		}
	}, [project, form]);

	const values = form.watch();
	const { isDirty } = useFormState({ control: form.control });

	const progress = progressSectionsOf(choosesOwner).map(
		({ title, fields }) => ({
			title,
			filled: fields.filter((field) => isFilled(values[field])).length,
			required: fields.length,
		}),
	);

	const totalFilled = progress.reduce((sum, item) => sum + item.filled, 0);
	const totalRequired = progress.reduce((sum, item) => sum + item.required, 0);
	const isComplete = totalFilled === totalRequired;

	const goToUnits = (id: string) =>
		void navigate({ to: "/projetos/$id/unidades", params: { id } });

	const onSubmit = (submitted: ProjectCreationFormValues) => {
		if (projectId === undefined) {
			createProject.mutate(submitted, {
				onSuccess: (response) => goToUnits(response.data.id),
			});
			return;
		}

		if (!isEditable || !isDirty) {
			goToUnits(projectId);
			return;
		}

		updateProject.mutate(
			// The owner never changes after the creation.
			{ id: projectId, payload: { ...submitted, ownerId: undefined } },
			{
				onSuccess: () => {
					// The latest calculation may now be outdated.
					void queryClient.invalidateQueries({
						queryKey: calculationKeys.latest(projectId),
					});
					goToUnits(projectId);
				},
			},
		);
	};

	const [mainStandard, ...otherStandards] = project?.standards ?? [];

	const content = (
		<>
			{projectId === undefined ? null : (
				<StageFindingsNotice
					projectId={projectId}
					findings={stageFindings}
					className="my-6"
				/>
			)}

			<form
				noValidate
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-1 flex-col"
			>
				<div className="grid flex-1 @5xl:grid-cols-[minmax(0,1fr)_400px]">
					<fieldset
						disabled={!isEditable || projectQuery.isLoading}
						className="min-w-0 space-y-9.5 px-6 py-8 md:px-10"
					>
						<section>
							<SectionHeading
								actions={<FindingBadge findings={stageFindings} />}
							>
								Identificação
							</SectionHeading>

							<div className="mt-5 grid gap-x-9.5 gap-y-5 md:grid-cols-2">
								{isAdmin ? (
									<ProjectOwnerField
										control={form.control}
										disabled={!choosesOwner}
										ownerName={project?.ownerName}
									/>
								) : null}

								<ControlledInput
									control={form.control}
									name="name"
									label="Nome do projeto"
									placeholder="Digite o nome do projeto"
									required
									variant="underline"
								/>

								<ProjectAddressFields form={form} />

								<ControlledInput
									control={form.control}
									name="floors"
									label="Nº de pavimentos"
									type="number"
									min={1}
									max={200}
									step={1}
									inputMode="numeric"
									placeholder="Ex.: 8"
									required
									variant="underline"
									className="font-mono"
								/>
							</div>
						</section>

						<section>
							<SectionHeading>Parâmetros Técnicos</SectionHeading>

							<div className="mt-5 grid gap-x-9.5 gap-y-5 md:grid-cols-2">
								<ControlledSelect
									control={form.control}
									name="buildingType"
									label="Tipo de edificação"
									placeholder="Selecione o tipo de edificação"
									items={buildingTypeLabels}
									required
									variant="underline"
								/>

								<ControlledSelect
									control={form.control}
									name="voltage"
									label="Tensão de fornecimento"
									placeholder="Selecione a tensão"
									items={voltageLabels}
									required
									variant="underline"
								/>

								<ControlledSelect
									control={form.control}
									name="connectionType"
									label="Tipo de ligação"
									placeholder="Selecione o tipo de ligação"
									items={connectionTypeLabels}
									required
									variant="underline"
								/>

								<ControlledSelect
									control={form.control}
									name="entranceStandard"
									label="Padrão de entrada"
									placeholder="Selecione o padrão de entrada"
									items={entranceStandardLabels}
									required
									variant="underline"
								/>
							</div>
						</section>
					</fieldset>

					<aside className="order-first flex flex-col gap-9.5 border-b border-border px-6 py-8 md:px-9.5 @5xl:order-none @5xl:border-b-0 @5xl:border-l">
						<div className="flex flex-col gap-5">
							{/* The exact revision only exists after the POST (`ApplicableStandards`). */}
							<ConclusionField
								label="Norma derivada"
								value={
									<span className="text-3xl tracking-[-0.03em]">
										{mainStandard?.name ?? "DIS-NOR-053"}
									</span>
								}
								caption={
									mainStandard
										? `${mainStandard.revision} vigente`
										: "Revisão vigente"
								}
							>
								{mainStandard && otherStandards.length === 0 ? null : (
									<p className="-mt-2 font-mono text-xs opacity-85">
										{mainStandard
											? otherStandards
													.map(({ name, revision }) => `e ${name} ${revision}`)
													.join(" ")
											: "e DIS-NOR-030"}
									</p>
								)}
							</ConclusionField>

							<p className="text-sm text-muted-foreground">
								Selecionada automaticamente ao salvar, a partir do tipo de
								edificação, da tensão e do padrão de entrada informados.
							</p>
						</div>

						{isEditable ? (
							<section aria-labelledby="preenchimento-titulo">
								<SectionHeading id="preenchimento-titulo">
									Preenchimento
								</SectionHeading>

								<p className="mt-5 flex items-center gap-3 font-mono text-3xl font-medium tracking-[-0.03em] text-foreground">
									{pad(totalFilled)}/{pad(totalRequired)}
									{isComplete ? (
										<Check aria-hidden="true" className="size-5" />
									) : null}
								</p>

								<p
									id={progressCounterId}
									className="mt-1.5 font-mono text-2xs tracking-[0.11em] text-faint-foreground uppercase"
								>
									Campos obrigatórios preenchidos
								</p>

								<ul className="mt-9.5 flex flex-col gap-5">
									{progress.map(({ title, filled, required }) => (
										<li key={title}>
											<div className="flex items-baseline justify-between border-b border-border-soft pb-1.5 text-sm text-foreground">
												<span>{title}</span>

												<span className="font-mono text-xs font-medium">
													{pad(filled)}/{pad(required)}
												</span>
											</div>

											<div className="mt-3 flex gap-1" aria-hidden="true">
												{Array.from({ length: required }, (_, index) => (
													<span
														key={index}
														className={`h-1 flex-1 ${
															index < filled ? "bg-primary" : "bg-border"
														}`}
													/>
												))}
											</div>
										</li>
									))}
								</ul>
							</section>
						) : null}
					</aside>
				</div>

				{isEditable ? (
					<StepFooter>
						{/* Preso ao contador do painel, e nao ao `formState`: aqui a
					    pergunta e "faltou preencher?", nao "o que foi preenchido e
					    valido?". Validade continua sendo do submit, que marca os
					    campos. O `aria-describedby` existe porque botao desabilitado
					    nao explica sozinho por que esta assim. */}
						<Button
							type="submit"
							disabled={!isComplete || isSaving}
							aria-describedby={isComplete ? undefined : progressCounterId}
						>
							{isSaving ? "Salvando..." : "Avançar para Unidades"}
							<ArrowRight aria-hidden="true" />
						</Button>
					</StepFooter>
				) : null}
			</form>
		</>
	);

	if (projectId !== undefined) return content;

	return (
		<PageLayout
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<div className="@container flex flex-1 flex-col bg-card">
				<div className="border-b border-border px-6 py-4 md:px-10">
					<ProjectBreadcrumb current="Novo Projeto" />
				</div>

				<div className="flex flex-col gap-3 border-b border-border px-6 pt-8 pb-6 md:px-10">
					<Eyebrow>Etapa 01: identificação da obra</Eyebrow>
					<h1 className="font-heading text-3xl font-medium tracking-[-0.032em]">
						Novo Projeto
					</h1>
					<p className="max-w-2xl text-sm text-muted-foreground">
						Depois de salvar os dados da edificação, o projeto ganha um
						protocolo e você segue para as unidades consumidoras.
					</p>
				</div>

				{content}
			</div>
		</PageLayout>
	);
};
