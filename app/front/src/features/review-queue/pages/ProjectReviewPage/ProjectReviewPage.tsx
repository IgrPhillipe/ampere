import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import {
	buildFindingReferenceOptions,
	CalculationSteps,
	ConsumerUnitGroupsTable,
	projectStatusLabels,
} from "@features/projects";
import { getHttpStatus } from "@lib/api-error";
import { useGetLatestCalculation } from "@services/calculation";
import {
	useGetConsumerUnitGroupList,
	useGetConsumerUnitGroupValidation,
} from "@services/consumer-units";
import {
	type Finding,
	type FindingResolution,
	type ReviewDecision,
	useAssignProjectReview,
	useCreateFinding,
	useDecideProjectReview,
	useDeleteFinding,
	useGetFindingList,
	useResolveFinding,
	useUpdateFinding,
} from "@services/project-review";
import { useGetProject } from "@services/projects";
import { useGetSubmission } from "@services/submission";
import { useNavigate } from "@tanstack/react-router";
import { Calculator, CircleAlert, History, Lock, Users } from "lucide-react";
import { useEffect, useState } from "react";

import {
	AutomaticVerification,
	checkToFindingValues,
	DecisionDialog,
	DecisionFooter,
	FindingsPanel,
	getDecisionAvailability,
	ReviewDocuments,
	ReviewHeader,
	toFindingPayload,
} from "../../components";
import { useFindingEditor } from "../../hooks";
import type { FindingFormValues } from "../../schemas";

interface ProjectReviewPageProps {
	projectId: string;
}

export const ProjectReviewPage = ({ projectId }: ProjectReviewPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const project = projectQuery.data?.data;
	const isUnderReview = project?.status === "UNDER_REVIEW";

	const assignment = useAssignProjectReview();
	const { mutate: assign } = assignment;

	useEffect(() => {
		if (isUnderReview) assign(projectId);
	}, [assign, isUnderReview, projectId]);

	const isAssigned = assignment.isSuccess;
	const isTaken = getHttpStatus(assignment.error) === 409;
	const editable = isUnderReview && isAssigned;

	const findingsQuery = useGetFindingList(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const groupsQuery = useGetConsumerUnitGroupList(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const submissionQuery = useGetSubmission(projectId);

	const findings = findingsQuery.data?.data;
	const calculation = calculationQuery.data?.data;
	const neverCalculated = calculationQuery.data === null;
	const groups = groupsQuery.data?.data ?? [];
	const validation = validationQuery.data?.data;
	const checklist = submissionQuery.data?.data;

	const createMutation = useCreateFinding();
	const updateMutation = useUpdateFinding();
	const deleteMutation = useDeleteFinding();
	const resolveMutation = useResolveFinding();
	const decideMutation = useDecideProjectReview();

	const findingEditor = useFindingEditor();
	const { editor } = findingEditor;
	const [decision, setDecision] = useState<ReviewDecision | null>(null);

	const referenceOptions = buildFindingReferenceOptions({
		groups,
		steps: calculation?.steps ?? [],
		checklistItems: checklist?.items ?? [],
	});

	const availability = getDecisionAvailability(findings ?? []);
	const reanalysis = isUnderReview && (project?.reviewCycle ?? 0) > 1;

	const units = validation
		? `${validation.totalUnits} em ${validation.totalGroups} ${
				validation.totalGroups === 1 ? "grupo" : "grupos"
			}`
		: undefined;

	const demandKva = neverCalculated
		? null
		: calculation
			? calculation.totals.finalKva
			: undefined;

	const saveFinding = (values: FindingFormValues) => {
		const payload = toFindingPayload(values, referenceOptions);

		if (editor.mode === "edit") {
			updateMutation.mutate(
				{ projectId, findingId: editor.findingId, payload },
				{ onSuccess: findingEditor.reset },
			);
		} else {
			createMutation.mutate(
				{ projectId, payload },
				{ onSuccess: findingEditor.reset },
			);
		}
	};

	const removeFinding = (finding: Finding) =>
		deleteMutation.mutate(
			{ projectId, findingId: finding.id },
			{
				onSuccess: () => {
					if (editor.mode === "edit" && editor.findingId === finding.id) {
						findingEditor.reset();
					}
				},
			},
		);

	const resolveFinding = (finding: Finding, resolution: FindingResolution) =>
		resolveMutation.mutate({ projectId, findingId: finding.id, resolution });

	const backToQueue = () => void navigate({ to: "/fila-de-analise" });

	const confirmDecision = (chosen: ReviewDecision, opinion: string) =>
		decideMutation.mutate(
			{ projectId, decision: chosen, opinion },
			{
				onSuccess: () => {
					setDecision(null);
					backToQueue();
				},
			},
		);

	const pendingId = deleteMutation.isPending
		? deleteMutation.variables?.findingId
		: resolveMutation.isPending
			? resolveMutation.variables?.findingId
			: undefined;

	const closedMessage =
		project && !isUnderReview
			? `Análise concluída: projeto ${projectStatusLabels[project.status]}.`
			: undefined;

	if (projectQuery.isError) {
		return (
			<PageLayout bleed className="mx-auto w-full max-w-page">
				<div className="px-6 md:px-8">
					<EmptyState
						title="Não foi possível abrir a análise do projeto"
						description="Confira o aviso exibido e tente novamente."
						icon={CircleAlert}
						action={
							<div className="flex gap-2">
								<Button type="button" variant="ghost" onClick={backToQueue}>
									Voltar para a Fila
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={() => void projectQuery.refetch()}
								>
									Tentar Novamente
								</Button>
							</div>
						}
					/>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<div className="flex flex-1 flex-col bg-card">
				<ReviewHeader
					project={project}
					isLoading={projectQuery.isPending || validationQuery.isPending}
					units={units}
					demandKva={demandKva}
					reanalysis={reanalysis}
				/>

				{isTaken ? (
					<p
						role="status"
						className="flex items-center gap-3 border-b border-border bg-surface-hover px-6 py-3 text-sm md:px-8"
					>
						<Lock aria-hidden="true" className="size-4 shrink-0" />
						<span>
							Em análise por {project?.reviewerName ?? "outro analista"}. Você
							pode consultar o projeto, mas só o responsável registra
							apontamentos e decide.
						</span>
					</p>
				) : null}

				{reanalysis && project?.changeSummary ? (
					<section
						aria-labelledby="change-summary-title"
						className="border-b border-border bg-accent px-6 py-4 md:px-8"
					>
						<p
							id="change-summary-title"
							className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase"
						>
							Resumo das Alterações da Versão {project.reviewCycle}
						</p>
						<p className="mt-2 text-sm whitespace-pre-line text-foreground">
							{project.changeSummary}
						</p>
					</section>
				) : null}

				<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_400px]">
					<Tabs defaultValue="memoria" className="px-6 py-8 md:px-8">
						<TabsList className="w-full justify-start overflow-x-auto">
							<TabsTrigger value="memoria" className="flex-none">
								Memória de Cálculo
							</TabsTrigger>
							<TabsTrigger value="unidades" className="flex-none">
								Unidades Consumidoras
							</TabsTrigger>
							<TabsTrigger value="documentos" className="flex-none">
								Documentos
							</TabsTrigger>
							<TabsTrigger value="historico" className="flex-none">
								Histórico
							</TabsTrigger>
						</TabsList>

						<TabsContent value="memoria" className="flex flex-col gap-10 pt-4">
							{neverCalculated ? (
								<EmptyState
									title="Este projeto não tem cálculo de demanda"
									description="O projeto foi enviado sem passar pela memória de cálculo."
									icon={Calculator}
								/>
							) : (
								<>
									<AutomaticVerification
										checks={calculation?.checks}
										isLoading={calculationQuery.isPending}
										onCreateFinding={
											editable
												? (check) =>
														findingEditor.start(checkToFindingValues(check))
												: undefined
										}
									/>
									<CalculationSteps
										steps={calculation?.steps}
										isLoading={calculationQuery.isPending}
									/>
								</>
							)}
						</TabsContent>

						<TabsContent value="unidades" className="flex flex-col gap-4 pt-4">
							{editable && groups.length > 0 ? (
								<p className="text-sm text-muted-foreground">
									Selecione o nome de um grupo para registrar um apontamento
									vinculado a ele.
								</p>
							) : null}
							<ConsumerUnitGroupsTable
								groups={groups}
								totalLoadKw={validation?.totalDeclaredLoadKw ?? 0}
								isLoading={groupsQuery.isPending}
								empty={
									<EmptyState
										title="Nenhum grupo cadastrado"
										description="O projeto foi enviado sem unidades consumidoras."
										icon={Users}
									/>
								}
								onOpenGroup={(group) => {
									if (!editable) return;
									findingEditor.start({
										stage: "CONSUMER_UNITS",
										reference: group.id,
									});
								}}
							/>
						</TabsContent>

						<TabsContent value="documentos" className="pt-4">
							<ReviewDocuments
								projectId={projectId}
								documents={checklist?.documents}
								isLoading={submissionQuery.isPending}
								onCreateFinding={
									editable
										? (document) =>
												findingEditor.start({
													stage: "DOCUMENTS",
													reference: document.type,
												})
										: undefined
								}
							/>
						</TabsContent>

						<TabsContent value="historico" className="pt-4">
							<EmptyState
								title="Histórico do protocolo"
								description="A linha do tempo com as versões e as decisões deste protocolo será exibida aqui."
								icon={History}
							/>
						</TabsContent>
					</Tabs>

					<FindingsPanel
						findings={findings}
						isLoading={findingsQuery.isPending}
						editable={editable}
						underReview={isUnderReview}
						editor={editor}
						autoFocusForm={findingEditor.autoFocus}
						referenceOptions={referenceOptions}
						isSaving={createMutation.isPending || updateMutation.isPending}
						pendingId={pendingId}
						onSubmit={saveFinding}
						onCancelEdit={findingEditor.reset}
						onEdit={findingEditor.edit}
						onDelete={removeFinding}
						onResolve={resolveFinding}
						className="border-t border-border lg:border-t-0 lg:border-l"
					/>
				</div>

				<DecisionFooter
					availability={availability}
					editable={editable && findings !== undefined}
					closedMessage={closedMessage}
					onBack={backToQueue}
					onDecide={setDecision}
				/>
			</div>

			<DecisionDialog
				decision={decision}
				pendingCount={availability.pendingCount}
				isPending={decideMutation.isPending}
				onOpenChange={(open) => {
					if (!open) setDecision(null);
				}}
				onConfirm={confirmDecision}
			/>
		</PageLayout>
	);
};
