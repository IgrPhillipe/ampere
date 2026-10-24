import {
	buildFindingReferenceOptions,
	ProjectWorkspace,
	projectStatusLabels,
	useProjectDetailActions,
} from "@features/projects";
import { padCount } from "@features/shared";
import { getHttpStatus } from "@lib/api-error";
import { useGetLatestCalculation } from "@services/calculation";
import { useGetConsumerUnitGroupList } from "@services/consumer-units";
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
import { Lock } from "lucide-react";
import { useEffect, useState } from "react";

import {
	DecisionDialog,
	DecisionFooter,
	FindingsPanel,
	getDecisionAvailability,
	isDraftFinding,
	toFindingPayload,
} from "../../components";
import { checkToFindingValues } from "../../constants";
import { useFindingEditor } from "../../hooks";
import type { FindingFormValues } from "../../schemas";

interface ProjectReviewWorkspaceProps {
	projectId: string;
}

/** The project page as the analyst sees it: the sections, plus the findings and the decision. */
export const ProjectReviewWorkspace = ({
	projectId,
}: ProjectReviewWorkspaceProps) => {
	const navigate = useNavigate();
	const project = useGetProject(projectId).data?.data;
	const isUnderReview = project?.status === "UNDER_REVIEW";

	const assignment = useAssignProjectReview();
	const { mutate: assign } = assignment;

	useEffect(() => {
		if (isUnderReview) assign(projectId);
	}, [assign, isUnderReview, projectId]);

	const isTaken = getHttpStatus(assignment.error) === 409;
	const actions = useProjectDetailActions({
		status: project?.status,
		ownerId: project?.ownerId,
		holdsReview: assignment.isSuccess,
	});

	const findingsQuery = useGetFindingList(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const groupsQuery = useGetConsumerUnitGroupList(projectId);
	const submissionQuery = useGetSubmission(projectId);

	const findings = findingsQuery.data?.data;
	const calculation = calculationQuery.data?.data;

	const createMutation = useCreateFinding();
	const updateMutation = useUpdateFinding();
	const deleteMutation = useDeleteFinding();
	const resolveMutation = useResolveFinding();
	const decideMutation = useDecideProjectReview();

	const findingEditor = useFindingEditor();
	const { editor } = findingEditor;
	const [decision, setDecision] = useState<ReviewDecision | null>(null);

	const referenceOptions = buildFindingReferenceOptions({
		groups: groupsQuery.data?.data ?? [],
		steps: calculation?.steps ?? [],
		checklistItems: submissionQuery.data?.data.items ?? [],
	});

	const availability = getDecisionAvailability(findings ?? []);
	const attention = (findings ?? [])
		.filter(isDraftFinding)
		.reduce<Partial<Record<Finding["stage"], number>>>((counts, finding) => {
			counts[finding.stage] = (counts[finding.stage] ?? 0) + 1;

			return counts;
		}, {});

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

	const confirmDecision = (chosen: ReviewDecision, opinion: string) =>
		decideMutation.mutate(
			{ projectId, decision: chosen, opinion },
			{
				onSuccess: () => {
					setDecision(null);
					void navigate({ to: "/fila-de-analise" });
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

	return (
		<ProjectWorkspace
			projectId={projectId}
			reviewing
			breadcrumbRoot={{ label: "Fila de Análise", to: "/fila-de-analise" }}
			metrics={[
				{
					label: "Pendências",
					value: findings ? padCount(availability.pendingCount) : undefined,
				},
				{
					label: "Bloqueantes",
					value: findings ? padCount(availability.blockingCount) : undefined,
				},
			]}
			attention={{
				data: attention.PROJECT_DATA,
				units: attention.CONSUMER_UNITS,
				calculation: attention.CALCULATION,
				documents: attention.DOCUMENTS,
			}}
			notices={
				isTaken ? (
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
				) : null
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
			footer={
				<DecisionFooter
					availability={availability}
					canDecide={actions.decide && findings !== undefined}
					closedMessage={closedMessage}
					onDecide={setDecision}
					className="border-t border-border"
				/>
			}
			registrar={
				actions.createFindings
					? {
							onCheck: (check) =>
								findingEditor.start(checkToFindingValues(check)),
							onGroup: (group) =>
								findingEditor.start({
									stage: "CONSUMER_UNITS",
									reference: group.id,
								}),
							onDocument: (document) =>
								findingEditor.start({
									stage: "DOCUMENTS",
									reference: document.type,
								}),
						}
					: undefined
			}
		>
			<DecisionDialog
				decision={decision}
				pendingCount={availability.pendingCount}
				isPending={decideMutation.isPending}
				onOpenChange={(open) => {
					if (!open) setDecision(null);
				}}
				onConfirm={confirmDecision}
			/>
		</ProjectWorkspace>
	);
};
