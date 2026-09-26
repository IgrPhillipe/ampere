import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { useZodForm } from "@features/shared";
import {
	type ConsumerUnitGroup,
	type ConsumerUnitGroupPayload,
	type GroupKind,
	useCreateConsumerUnitGroup,
	useGetConsumerUnitGroupList,
	useGetConsumerUnitGroupValidation,
} from "@services/consumer-units";
import { useGetProject } from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CircleAlert, Layers, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { useWatch } from "react-hook-form";

import {
	ConsumerUnitGroupsTable,
	GroupSheet,
	type OpenedGroup,
	ProjectStamp,
	ProjectStepper,
	ValidationPanel,
} from "../../components";
import { GROUP_USAGE_TYPES } from "../../constants";
import { type NewGroupFormValues, newGroupSchema } from "../../schemas";

const pendingCounterId = "unidades-pendencias";

const newGroupLoad: Record<
	GroupKind,
	(load: number | null) => Partial<ConsumerUnitGroupPayload>
> = {
	RESIDENTIAL: (load) => ({ unitLoadKw: load }),
	LOAD: () => ({ items: [] }),
	EV_CHARGING: (load) => ({ powerPerPointKw: load }),
};

interface ConsumerUnitsPageProps {
	projectId: string;
}

export const ConsumerUnitsPage = ({ projectId }: ConsumerUnitsPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const groupsQuery = useGetConsumerUnitGroupList(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const createGroup = useCreateConsumerUnitGroup(projectId);

	const [isAdding, setIsAdding] = useState(false);
	const [opened, setOpened] = useState<OpenedGroup | null>(null);

	const form = useZodForm(newGroupSchema, {
		name: "",
		usageType: undefined,
		quantity: undefined,
		load: null,
	});

	// `form.watch` is memoized by the React Compiler.
	const usageType = useWatch({ control: form.control, name: "usageType" });
	const project = projectQuery.data?.data;
	const groups = groupsQuery.data?.data ?? [];
	const validation = validationQuery.data?.data;
	const canCalculate = validation?.canCalculate ?? false;
	const isEditable = project?.status === "DRAFT";
	const hasError =
		projectQuery.isError || groupsQuery.isError || validationQuery.isError;

	const openGroup = useCallback(
		(group: ConsumerUnitGroup) => setOpened({ group }),
		[],
	);

	const startAdding = () => {
		form.reset();
		setIsAdding(true);
	};

	const cancelAdding = () => {
		form.reset();
		setIsAdding(false);
	};

	const saveNewGroup = (values: NewGroupFormValues) => {
		const { kind, usage } = GROUP_USAGE_TYPES[values.usageType];

		createGroup.mutate(
			{
				projectId,
				payload: {
					kind,
					usage,
					name: values.name,
					quantity: values.quantity,
					...newGroupLoad[kind](values.load),
				},
			},
			{ onSuccess: cancelAdding },
		);
	};

	const units = validation
		? `${validation.totalUnits} em ${validation.totalGroups} ${
				validation.totalGroups === 1 ? "grupo" : "grupos"
			}`
		: undefined;

	return (
		<PageLayout
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<form
				noValidate
				onSubmit={form.handleSubmit(saveNewGroup)}
				className="flex flex-1 flex-col bg-card"
			>
				<ProjectStamp
					project={project}
					isLoading={projectQuery.isPending || validationQuery.isPending}
					units={units}
				/>

				<div className="px-6 pt-8 md:px-8">
					<p className="text-xs tracking-wider text-muted-foreground uppercase">
						Etapa 02: Cadastro das unidades
					</p>

					<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
						Unidades Consumidoras
					</h1>
				</div>

				<ProjectStepper current={1} className="mt-6" />

				{hasError ? (
					<div className="flex-1 px-6 py-8 md:px-8">
						<EmptyState
							title="Não foi possível carregar as unidades do projeto"
							description="Verifique sua conexão e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										void projectQuery.refetch();
										void groupsQuery.refetch();
										void validationQuery.refetch();
									}}
								>
									Tentar Novamente
								</Button>
							}
						/>
					</div>
				) : (
					<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_380px]">
						<section
							aria-labelledby="grupos-titulo"
							className="px-6 py-8 md:px-8"
						>
							<div className="flex items-center justify-between gap-4 border-b border-foreground pb-3">
								<h2
									id="grupos-titulo"
									className="text-lg font-semibold text-foreground"
								>
									Grupos de Unidades
								</h2>

								{isEditable ? (
									<Button
										type="button"
										variant="link"
										size="sm"
										onClick={startAdding}
										disabled={isAdding}
									>
										<Plus aria-hidden="true" />
										Adicionar Grupo
									</Button>
								) : null}
							</div>

							<ConsumerUnitGroupsTable
								groups={groups}
								totalLoadKw={validation?.totalDeclaredLoadKw ?? 0}
								isLoading={groupsQuery.isPending}
								onOpenGroup={openGroup}
								newGroupControl={isAdding ? form.control : undefined}
								newGroupUsageType={usageType}
								empty={
									<div className="mt-6">
										<EmptyState
											title="Nenhum grupo cadastrado"
											description={
												isEditable
													? "Cadastre os apartamentos, as áreas comuns e a recarga de veículos do projeto."
													: "O projeto foi enviado sem grupos de unidades."
											}
											icon={Layers}
											action={
												isEditable ? (
													<Button
														type="button"
														variant="outline"
														onClick={startAdding}
													>
														<Plus aria-hidden="true" />
														Adicionar Grupo
													</Button>
												) : undefined
											}
										/>
									</div>
								}
							/>
						</section>

						<ValidationPanel
							groups={groups}
							validation={validation}
							isLoading={validationQuery.isPending || groupsQuery.isPending}
							counterId={pendingCounterId}
							onOpenIssue={(group, issue) =>
								setOpened({ group, focusField: issue.field })
							}
						/>
					</div>
				)}

				<div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 md:px-8">
					<Button
						type="button"
						variant="outline"
						size="icon"
						aria-label="Voltar para Dados da Edificação"
						onClick={() =>
							void navigate({
								to: "/projetos/$id/dados",
								params: { id: projectId },
							})
						}
					>
						<ArrowLeft aria-hidden="true" />
					</Button>

					{isAdding ? (
						<div className="flex items-center gap-2">
							<Button type="button" variant="ghost" onClick={cancelAdding}>
								Cancelar
							</Button>

							<Button
								type="submit"
								variant="outline"
								disabled={createGroup.isPending}
							>
								{createGroup.isPending ? "Salvando..." : "Salvar Grupo"}
								<ArrowRight aria-hidden="true" />
							</Button>
						</div>
					) : (
						<Button
							type="button"
							variant="outline"
							disabled={!canCalculate}
							aria-describedby={canCalculate ? undefined : pendingCounterId}
							onClick={() =>
								void navigate({
									to: "/projetos/$id/calculo",
									params: { id: projectId },
								})
							}
						>
							Calcular Demanda
							<ArrowRight aria-hidden="true" />
						</Button>
					)}
				</div>
			</form>

			<GroupSheet
				projectId={projectId}
				readOnly={!isEditable}
				opened={opened}
				onClose={() => setOpened(null)}
			/>
		</PageLayout>
	);
};
