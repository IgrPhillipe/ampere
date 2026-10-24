import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { formatDateTime } from "@features/shared";
import {
	calculationKeys,
	useGetLatestCalculation,
} from "@services/calculation";
import {
	type ConsumerUnitGroup,
	useGetConsumerUnitGroupList,
	useGetConsumerUnitGroupValidation,
} from "@services/consumer-units";
import {
	type Finding,
	projectReviewKeys,
	useGetFindingList,
	useRespondFinding,
} from "@services/project-review";
import { useGetProject } from "@services/projects";
import {
	useGetMemorial,
	useGetSubmission,
	useSubmitProject,
} from "@services/submission";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Check, CircleAlert, Download, Send } from "lucide-react";
import { useState } from "react";

import {
	ChangeSummaryNotice,
	GroupSheet,
	NextStepsPanel,
	type OpenedGroup,
	ProjectDetailFooter,
	ProjectDetailHeader,
	ProjectDetailLayout,
	ProjectDetailTabs,
	ProjectFindingsOverview,
	ResubmissionPanel,
} from "../../components";
import {
	awaitsDesignerResponse,
	buildFindingReferenceOptions,
	findingTarget,
	projectVersion,
} from "../../constants";
import { useProjectDetailActions, useProjectPermissions } from "../../hooks";
import type { FindingResponseValues, ResubmissionValues } from "../../schemas";

const stageRoutes = {
	PROJECT_DATA: "/projetos/$id/dados",
	CONSUMER_UNITS: "/projetos/$id/unidades",
	CALCULATION: "/projetos/$id/calculo",
	DOCUMENTS: "/projetos/$id/memorial",
} as const;

interface ProjectDetailPageProps {
	projectId: string;
}

export const ProjectDetailPage = ({ projectId }: ProjectDetailPageProps) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const projectQuery = useGetProject(projectId);
	const findingsQuery = useGetFindingList(projectId);
	const groupsQuery = useGetConsumerUnitGroupList(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const submissionQuery = useGetSubmission(projectId);
	const respondMutation = useRespondFinding();
	const submitMutation = useSubmitProject();
	const [responseEditor, setResponseEditor] = useState<{
		findingId: string;
		status: FindingResponseValues["status"];
	} | null>(null);
	const [openedGroup, setOpenedGroup] = useState<OpenedGroup | null>(null);

	const project = projectQuery.data?.data;
	const { canEdit } = useProjectPermissions(project);
	const findings = findingsQuery.data?.data;
	const checklist = submissionQuery.data?.data;
	const validation = validationQuery.data?.data;
	const calculation =
		calculationQuery.data === null ? null : calculationQuery.data?.data;
	const submittedAt = project?.submittedAt;
	const notSent =
		project?.status === "DRAFT" || project?.status === "AWAITING_SUBMISSION";
	const memorialQuery = useGetMemorial(projectId, {
		enabled: project !== undefined && !notSent,
	});
	const actions = useProjectDetailActions({
		status: project?.status,
		ownerId: project?.ownerId,
	});

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
	const reanalysis =
		project?.status === "UNDER_REVIEW" && project.reviewCycle > 1;

	const referenceOptions = buildFindingReferenceOptions({
		groups: groupsQuery.data?.data ?? [],
		steps: calculation?.steps ?? [],
		checklistItems: checklist?.items ?? [],
	});
	const markedFindings =
		project && findings
			? findings.filter((finding) => awaitsDesignerResponse(finding, project))
			: [];

	const backToProjects = () => void navigate({ to: "/projetos" });
	const retryTabs = () => {
		void calculationQuery.refetch();
		void groupsQuery.refetch();
		void validationQuery.refetch();
		void submissionQuery.refetch();
	};
	const openStage = (finding: Finding) =>
		void navigate({
			to: stageRoutes[finding.stage],
			params: { id: projectId },
			hash: findingTarget(finding),
		});
	const openGroup = (group: ConsumerUnitGroup) => setOpenedGroup({ group });

	const downloadMemorial = () => {
		const memorial = memorialQuery.data;
		if (!memorial) return;

		const url = URL.createObjectURL(memorial.blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = memorial.filename;
		link.click();
		URL.revokeObjectURL(url);
	};

	const submitResponse = (values: FindingResponseValues) => {
		if (!responseEditor) return;

		respondMutation.mutate(
			{
				projectId,
				findingId: responseEditor.findingId,
				status: values.status,
				response: values.response || undefined,
			},
			{ onSuccess: () => setResponseEditor(null) },
		);
	};

	const resubmit = ({ changeSummary }: ResubmissionValues) =>
		submitMutation.mutate(
			{ projectId, changeSummary },
			{
				onSuccess: async () => {
					setResponseEditor(null);
					await Promise.all([
						queryClient.invalidateQueries({
							queryKey: projectReviewKeys.findings(projectId),
						}),
						queryClient.invalidateQueries({
							queryKey: calculationKeys.all(),
						}),
					]);
				},
			},
		);

	if (projectQuery.isError) {
		return (
			<PageLayout bleed className="mx-auto w-full max-w-page">
				<div className="px-6 md:px-8">
					<EmptyState
						title="Não foi possível abrir o projeto"
						description="Confira o aviso exibido e tente novamente."
						icon={CircleAlert}
						action={
							<div className="flex gap-2">
								<Button type="button" variant="ghost" onClick={backToProjects}>
									Voltar para Meus Projetos
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

	if (notSent) {
		return (
			<PageLayout bleed className="mx-auto w-full max-w-page">
				<div className="px-6 md:px-8">
					<EmptyState
						title="Este projeto ainda não foi enviado"
						description="Anexe os documentos obrigatórios e envie o projeto na etapa do memorial."
						icon={Send}
						action={
							<Button
								type="button"
								variant="outline"
								onClick={() =>
									void navigate({
										to: "/projetos/$id/memorial",
										params: { id: projectId },
									})
								}
							>
								Ir para o Memorial
							</Button>
						}
					/>
				</div>
			</PageLayout>
		);
	}

	return (
		<ProjectDetailLayout
			header={
				<ProjectDetailHeader
					project={project}
					isLoading={projectQuery.isPending || validationQuery.isPending}
					units={units}
					demandKva={demandKva}
					reanalysis={reanalysis}
					correcting={actions.resubmit}
				/>
			}
			notices={
				project?.status === "UNDER_REVIEW" ? (
					<>
						{submittedAt ? (
							<p
								role="status"
								className="flex items-center gap-3 border-b border-border px-6 py-3 text-sm md:px-8"
							>
								<Check
									aria-hidden="true"
									className="size-4 shrink-0 text-primary"
								/>
								<span>
									Projeto enviado em{" "}
									<time dateTime={submittedAt}>
										{formatDateTime(submittedAt)}
									</time>
									. Guarde o protocolo{" "}
									<span className="font-mono">{project.protocol}</span> para
									acompanhar a análise.
								</span>
							</p>
						) : null}
						{reanalysis && project.changeSummary ? (
							<ChangeSummaryNotice
								version={project.reviewCycle}
								summary={project.changeSummary}
							/>
						) : null}
					</>
				) : null
			}
			footer={
				<ProjectDetailFooter
					backLabel="Voltar para Meus Projetos"
					onBack={backToProjects}
				>
					<Button
						type="button"
						variant="link"
						disabled={!memorialQuery.data}
						onClick={downloadMemorial}
					>
						<Download aria-hidden="true" />
						Baixar Memorial
					</Button>
				</ProjectDetailFooter>
			}
			aside={
				findingsQuery.isError || submissionQuery.isError ? (
					<div className="px-6 py-8 md:px-8">
						<EmptyState
							title="Não foi possível carregar os apontamentos"
							description="Confira o aviso exibido e tente novamente."
							icon={CircleAlert}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										void findingsQuery.refetch();
										void submissionQuery.refetch();
									}}
								>
									Tentar Novamente
								</Button>
							}
						/>
					</div>
				) : project ? (
					<ProjectFindingsOverview
						findings={findings}
						project={project}
						referenceOptions={referenceOptions}
						canRespond={actions.respondFindings}
						responseEditor={responseEditor ?? undefined}
						isResponding={respondMutation.isPending}
						summary={
							actions.resubmit && submissionQuery.isPending ? (
								<div
									role="status"
									aria-label="Carregando o reenvio"
									className="space-y-3 border-t border-border p-5"
								>
									<Skeleton className="h-5 w-40" />
									<Skeleton className="h-24 w-full" />
									<Skeleton className="h-9 w-full" />
								</div>
							) : actions.resubmit && checklist?.requiresChangeSummary ? (
								<ResubmissionPanel
									nextVersion={projectVersion(project)}
									unansweredBlocking={checklist.unansweredBlocking}
									canSubmit={checklist.canSubmit}
									isPending={submitMutation.isPending}
									onSubmit={resubmit}
								/>
							) : submittedAt && project.status === "UNDER_REVIEW" ? (
								<NextStepsPanel submittedAt={submittedAt} />
							) : null
						}
						onOpenStage={openStage}
						onStartResponse={(finding, status) =>
							setResponseEditor({ findingId: finding.id, status })
						}
						onSubmitResponse={submitResponse}
						onCancelResponse={() => setResponseEditor(null)}
					/>
				) : (
					<div
						aria-busy="true"
						className="flex flex-col gap-3 px-6 py-8 md:px-8"
					>
						<Skeleton className="h-5 w-40" />
						<Skeleton className="h-24 w-full" />
					</div>
				)
			}
		>
			<ProjectDetailTabs
				projectId={projectId}
				calculation={calculation}
				failed={{
					calculation: calculationQuery.isError,
					groups: groupsQuery.isError,
					documents: submissionQuery.isError,
				}}
				onRetry={retryTabs}
				groups={groupsQuery.data?.data}
				totalLoadKw={validation?.totalDeclaredLoadKw ?? 0}
				documents={checklist?.documents}
				markedFindings={markedFindings}
				groupHint="Selecione o nome de um grupo para ver os dados dele."
				onOpenGroup={openGroup}
			/>

			<GroupSheet
				projectId={projectId}
				readOnly={!canEdit}
				opened={openedGroup}
				onClose={() => setOpenedGroup(null)}
			/>
		</ProjectDetailLayout>
	);
};
