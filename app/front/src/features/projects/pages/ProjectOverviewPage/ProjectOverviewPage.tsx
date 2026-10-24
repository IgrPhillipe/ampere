import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { Skeleton } from "@components/ui/skeleton";
import { cn } from "@lib/utils";
import { calculationKeys } from "@services/calculation";
import { useGetConsumerUnitGroupList } from "@services/consumer-units";
import {
	type Finding,
	projectReviewKeys,
	useRespondFinding,
} from "@services/project-review";
import { useSubmitProject } from "@services/submission";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import { useState } from "react";

import {
	NextStepsPanel,
	ProjectFindingsOverview,
	ProjectSummary,
	ResubmissionPanel,
	ReviewOpinion,
	useWorkspaceReviewing,
} from "../../components";
import {
	buildFindingReferenceOptions,
	findingTarget,
	projectVersion,
	sectionPath,
	stageSections,
} from "../../constants";
import { useProjectDetailActions, useProjectWorkspace } from "../../hooks";
import type { FindingResponseValues, ResubmissionValues } from "../../schemas";

interface ProjectOverviewPageProps {
	projectId: string;
}

export const ProjectOverviewPage = ({
	projectId,
}: ProjectOverviewPageProps) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const reviewing = useWorkspaceReviewing();
	const workspace = useProjectWorkspace(projectId);
	const { project, findings, checklist, calculation, permissions } = workspace;
	const groupsQuery = useGetConsumerUnitGroupList(projectId);
	const respondMutation = useRespondFinding();
	const submitMutation = useSubmitProject();
	const [responseEditor, setResponseEditor] = useState<{
		findingId: string;
		status: FindingResponseValues["status"];
	} | null>(null);
	const actions = useProjectDetailActions({
		status: project?.status,
		ownerId: project?.ownerId,
	});

	const submitted =
		project !== undefined &&
		project.status !== "DRAFT" &&
		project.status !== "AWAITING_SUBMISSION";
	const referenceOptions = buildFindingReferenceOptions({
		groups: groupsQuery.data?.data ?? [],
		steps: calculation?.steps ?? [],
		checklistItems: checklist?.items ?? [],
	});

	const openSection = (finding: Finding) =>
		void navigate({
			to: sectionPath(stageSections[finding.stage]),
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

	const panel = reviewing ? null : actions.resubmit ? (
		checklist?.requiresChangeSummary && project ? (
			<ResubmissionPanel
				nextVersion={projectVersion(project)}
				unansweredBlocking={checklist.unansweredBlocking}
				canSubmit={checklist.canSubmit}
				isPending={submitMutation.isPending}
				onSubmit={resubmit}
			/>
		) : checklist ? null : (
			<div
				role="status"
				aria-label="Carregando o reenvio"
				className="space-y-3 p-5"
			>
				<Skeleton className="h-5 w-40" />
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-9 w-full" />
			</div>
		)
	) : project?.status === "UNDER_REVIEW" && project.submittedAt ? (
		<NextStepsPanel submittedAt={project.submittedAt} />
	) : null;

	return (
		<div
			className={cn(
				"grid flex-1 content-start",
				panel && "@5xl:grid-cols-[minmax(0,1fr)_400px]",
			)}
		>
			<div className="flex min-w-0 flex-col gap-10 px-6 py-8 md:px-8">
				{project ? <ReviewOpinion project={project} /> : null}

				<ProjectSummary
					projectId={projectId}
					project={project}
					validation={workspace.validation}
					calculation={calculation}
					checklist={checklist}
					sections={workspace.sections}
					editing={permissions.canEdit}
				/>

				{!reviewing && submitted && workspace.findingsQuery.isError ? (
					<EmptyState
						title="Não foi possível carregar os apontamentos"
						description="Confira o aviso exibido e tente novamente."
						icon={CircleAlert}
						action={
							<Button
								type="button"
								variant="outline"
								onClick={() => void workspace.findingsQuery.refetch()}
							>
								Tentar Novamente
							</Button>
						}
					/>
				) : !reviewing && submitted ? (
					<ProjectFindingsOverview
						findings={findings}
						project={project}
						referenceOptions={referenceOptions}
						canRespond={actions.respondFindings}
						responseEditor={responseEditor ?? undefined}
						isResponding={respondMutation.isPending}
						onOpenStage={permissions.canEdit ? openSection : undefined}
						onStartResponse={(finding, status) =>
							setResponseEditor({ findingId: finding.id, status })
						}
						onSubmitResponse={submitResponse}
						onCancelResponse={() => setResponseEditor(null)}
						className="p-0 md:p-0"
					/>
				) : null}
			</div>

			{panel ? (
				<aside
					id="reenvio"
					className="border-t border-border @5xl:border-t-0 @5xl:border-l"
				>
					{panel}
				</aside>
			) : null}
		</div>
	);
};
