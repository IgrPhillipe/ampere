import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import {
	calculationKeys,
	useGetLatestCalculation,
} from "@services/calculation";
import {
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
import { useGetSubmission, useSubmitProject } from "@services/submission";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CircleAlert, ClipboardCheck } from "lucide-react";
import { useState } from "react";

import {
	ProjectFindingsOverview,
	ProjectStamp,
	ResubmissionPanel,
} from "../../components";
import {
	buildFindingReferenceOptions,
	findingTarget,
	projectVersion,
} from "../../constants";
import { useProjectPermissions } from "../../hooks";
import type { FindingResponseValues, ResubmissionValues } from "../../schemas";

const stageRoutes = {
	PROJECT_DATA: "/projetos/$id/dados",
	CONSUMER_UNITS: "/projetos/$id/unidades",
	CALCULATION: "/projetos/$id/calculo",
	DOCUMENTS: "/projetos/$id/memorial",
} as const;

interface ProjectFindingsPageProps {
	projectId: string;
}

export const ProjectFindingsPage = ({
	projectId,
}: ProjectFindingsPageProps) => {
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
	const project = projectQuery.data?.data;
	const { isOwner } = useProjectPermissions(project);
	const findings = findingsQuery.data?.data;
	const checklist = submissionQuery.data?.data;
	const validation = validationQuery.data?.data;
	const units = validation
		? `${validation.totalUnits} em ${validation.totalGroups} ${
				validation.totalGroups === 1 ? "grupo" : "grupos"
			}`
		: undefined;
	const hasError =
		projectQuery.isError || findingsQuery.isError || submissionQuery.isError;

	const referenceOptions = buildFindingReferenceOptions({
		groups: groupsQuery.data?.data ?? [],
		steps: calculationQuery.data?.data.steps ?? [],
		checklistItems: checklist?.items ?? [],
	});

	const backToProjects = () => void navigate({ to: "/projetos" });
	const openStage = (finding: Finding) =>
		void navigate({
			to: stageRoutes[finding.stage],
			params: { id: projectId },
			hash: findingTarget(finding),
		});
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
					await Promise.all([
						queryClient.invalidateQueries({
							queryKey: projectReviewKeys.findings(projectId),
						}),
						queryClient.invalidateQueries({
							queryKey: calculationKeys.all(),
						}),
					]);
					void navigate({
						to: "/projetos/$id/envio",
						params: { id: projectId },
					});
				},
			},
		);

	return (
		<PageLayout
			title={project?.name ?? "Apontamentos do Projeto"}
			description={
				project
					? `Protocolo ${project.protocol}. Responda os apontamentos, corrija as etapas indicadas e reenvie o projeto.`
					: "Responda os apontamentos, corrija as etapas indicadas e reenvie o projeto."
			}
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<ProjectStamp
				project={project}
				isLoading={projectQuery.isPending}
				units={units}
			/>

			<section
				aria-label="Correção dos apontamentos"
				className="flex flex-1 flex-col gap-6 bg-card px-6 py-8 md:px-8"
			>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="self-start"
					onClick={backToProjects}
				>
					<ArrowLeft aria-hidden="true" />
					Meus Projetos
				</Button>

				{hasError ? (
					<EmptyState
						title="Não foi possível carregar os apontamentos"
						description="Confira o aviso exibido e tente novamente."
						icon={CircleAlert}
						action={
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									void projectQuery.refetch();
									void findingsQuery.refetch();
									void submissionQuery.refetch();
								}}
							>
								Tentar Novamente
							</Button>
						}
					/>
				) : projectQuery.isPending || findingsQuery.isPending ? (
					<div
						role="status"
						aria-label="Carregando apontamentos"
						className="space-y-4"
					>
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-40 w-full" />
						<Skeleton className="h-40 w-full" />
					</div>
				) : findings?.length === 0 ? (
					<EmptyState
						title="Nenhum apontamento encontrado"
						description="Este projeto não possui apontamentos publicados."
						icon={ClipboardCheck}
					/>
				) : findings && project ? (
					<ProjectFindingsOverview
						findings={findings}
						project={project}
						referenceOptions={referenceOptions}
						responseEditor={responseEditor ?? undefined}
						isResponding={respondMutation.isPending}
						canAnswer={isOwner}
						resubmission={
							!isOwner ? null : submissionQuery.isPending ? (
								<div
									role="status"
									aria-label="Carregando o reenvio"
									className="space-y-3 border-t border-border p-5"
								>
									<Skeleton className="h-5 w-40" />
									<Skeleton className="h-24 w-full" />
									<Skeleton className="h-9 w-full" />
								</div>
							) : checklist?.requiresChangeSummary ? (
								<ResubmissionPanel
									nextVersion={projectVersion(project)}
									unansweredBlocking={checklist.unansweredBlocking}
									canSubmit={checklist.canSubmit}
									isPending={submitMutation.isPending}
									onSubmit={resubmit}
								/>
							) : null
						}
						onOpenStage={openStage}
						onStartResponse={(finding, status) =>
							setResponseEditor({ findingId: finding.id, status })
						}
						onSubmitResponse={submitResponse}
						onCancelResponse={() => setResponseEditor(null)}
					/>
				) : null}
			</section>
		</PageLayout>
	);
};
