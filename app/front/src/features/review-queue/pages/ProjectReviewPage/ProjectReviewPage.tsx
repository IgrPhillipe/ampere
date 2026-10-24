import { Breadcrumb } from "@components/Breadcrumb";
import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import {
	buildFindingReferenceOptions,
	ChangeSummaryNotice,
	GroupSheet,
	MemorialPreview,
	type OpenedGroup,
	ProjectDetailHeader,
	ProjectDetailLayout,
	ProjectDetailTabs,
	projectStatusLabels,
	useProjectDetailActions,
} from "@features/projects";
import { padCount, useAuthStore } from "@features/shared";
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
import { useGetMemorial, useGetSubmission } from "@services/submission";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlert, Lock } from "lucide-react";
import { useEffect, useState } from "react";

import {
	DecisionDialog,
	DecisionFooter,
	FindingsPanel,
	getDecisionAvailability,
	toFindingPayload,
} from "../../components";
import { checkToFindingValues } from "../../constants";
import { useFindingEditor } from "../../hooks";
import type { FindingFormValues } from "../../schemas";

interface ProjectReviewPageProps {
	projectId: string;
}

export const ProjectReviewPage = ({ projectId }: ProjectReviewPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const project = projectQuery.data?.data;
	const userId = useAuthStore((state) => state.user?.id);
	// Nobody reviews their own project, so the admin who owns it only reads.
	const isOwnProject = project !== undefined && project.ownerId === userId;
	const isUnderReview = project?.status === "UNDER_REVIEW";

	const assignment = useAssignProjectReview();
	const { mutate: assign } = assignment;

	useEffect(() => {
		if (isUnderReview && !isOwnProject) assign(projectId);
	}, [assign, isUnderReview, isOwnProject, projectId]);

	const isTaken = getHttpStatus(assignment.error) === 409;
	const actions = useProjectDetailActions({
		status: project?.status,
		ownerId: project?.ownerId,
		holdsReview: assignment.isSuccess,
	});

	const findingsQuery = useGetFindingList(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const groupsQuery = useGetConsumerUnitGroupList(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const submissionQuery = useGetSubmission(projectId);
	const memorialQuery = useGetMemorial(projectId);

	const findings = findingsQuery.data?.data;
	const calculation =
		calculationQuery.data === null ? null : calculationQuery.data?.data;
	const groups = groupsQuery.data?.data;
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
	const [openedGroup, setOpenedGroup] = useState<OpenedGroup | null>(null);

	const referenceOptions = buildFindingReferenceOptions({
		groups: groups ?? [],
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

	const demandKva =
		calculation === null
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
			? `Análise Concluída: Projeto ${projectStatusLabels[project.status]}`
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
		<>
			<ProjectDetailLayout
				header={
					<ProjectDetailHeader
						breadcrumb={
							<Breadcrumb
								items={[
									{ label: "Fila de Análise", to: "/fila-de-analise" },
									...(project ? [{ label: project.name }] : []),
								]}
							/>
						}
						project={project}
						isLoading={projectQuery.isPending || validationQuery.isPending}
						units={units}
						demandKva={demandKva}
						reanalysis={reanalysis}
						metrics={[
							{
								label: "Pendências",
								value: findings
									? padCount(availability.pendingCount)
									: undefined,
							},
							{
								label: "Bloqueantes",
								value: findings
									? padCount(availability.blockingCount)
									: undefined,
							},
						]}
					/>
				}
				notices={
					isTaken || isOwnProject || (reanalysis && project?.changeSummary) ? (
						<>
							{isOwnProject ? (
								<p
									role="status"
									className="flex items-center gap-3 border-b border-border bg-surface-hover px-6 py-3 text-sm md:px-8"
								>
									<Lock aria-hidden="true" className="size-4 shrink-0" />
									<span>
										Este projeto é seu. Você pode consultá-lo, mas a análise
										fica com outro analista.
									</span>
								</p>
							) : null}
							{isTaken ? (
								<p
									role="status"
									className="flex items-center gap-3 border-b border-border bg-surface-hover px-6 py-3 text-sm md:px-8"
								>
									<Lock aria-hidden="true" className="size-4 shrink-0" />
									<span>
										Em análise por {project?.reviewerName ?? "outro analista"}.
										Você pode consultar o projeto, mas só o responsável registra
										apontamentos e decide.
									</span>
								</p>
							) : null}
							{reanalysis && project?.changeSummary ? (
								<ChangeSummaryNotice
									version={project.reviewCycle}
									summary={project.changeSummary}
								/>
							) : null}
						</>
					) : null
				}
				footer={
					<DecisionFooter
						availability={availability}
						canDecide={actions.decide && findings !== undefined}
						closedMessage={closedMessage}
						onDecide={setDecision}
					/>
				}
				aside={
					<FindingsPanel
						findings={findings}
						isLoading={findingsQuery.isPending}
						editable={actions.createFindings}
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
					/>
				}
			>
				<ProjectDetailTabs
					projectId={projectId}
					memorial={
						<MemorialPreview
							project={project}
							calculation={calculation ?? undefined}
							memorial={memorialQuery.data}
							isLoading={memorialQuery.isPending}
						/>
					}
					calculation={calculation}
					failed={{
						calculation: calculationQuery.isError,
						groups: groupsQuery.isError,
						documents: submissionQuery.isError,
					}}
					onRetry={() => {
						void calculationQuery.refetch();
						void groupsQuery.refetch();
						void validationQuery.refetch();
						void submissionQuery.refetch();
					}}
					groups={groups}
					totalLoadKw={validation?.totalDeclaredLoadKw ?? 0}
					documents={checklist?.documents}
					groupHint={
						actions.createFindings
							? "Selecione um grupo para ver os dados e registrar um apontamento vinculado a ele."
							: "Selecione um grupo para ver os dados dele."
					}
					onOpenGroup={(group) => setOpenedGroup({ group })}
					onCheckFinding={
						actions.createFindings
							? (check) => findingEditor.start(checkToFindingValues(check))
							: undefined
					}
					onDocumentFinding={
						actions.createFindings
							? (document) =>
									findingEditor.start({
										stage: "DOCUMENTS",
										reference: document.type,
									})
							: undefined
					}
				/>
			</ProjectDetailLayout>

			<GroupSheet
				projectId={projectId}
				readOnly
				opened={openedGroup}
				onClose={() => setOpenedGroup(null)}
				onCreateFinding={
					actions.createFindings
						? (group) =>
								findingEditor.start({
									stage: "CONSUMER_UNITS",
									reference: group.id,
								})
						: undefined
				}
			/>

			<DecisionDialog
				decision={decision}
				pendingCount={availability.pendingCount}
				isPending={decideMutation.isPending}
				onOpenChange={(open) => {
					if (!open) setDecision(null);
				}}
				onConfirm={confirmDecision}
			/>
		</>
	);
};
