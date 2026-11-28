import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { downloadFile } from "@features/shared";
import { getHttpStatus } from "@lib/api-error";
import { cn } from "@lib/utils";
import {
	useExportCalculationSpreadsheet,
	useGetLatestCalculation,
} from "@services/calculation";
import { useGetProjectVersionList } from "@services/project-versions";
import { useGetProject } from "@services/projects";
import { useGetMemorial, useGetSubmission } from "@services/submission";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Calculator, CircleAlert } from "lucide-react";

import {
	CalculationExportButton,
	MemorialPreview,
	NormativeRevisionNotice,
	StepFooter,
	SubmissionChecklistPanel,
	useWorkspaceReviewing,
} from "../../components";
import { getMemorialStamp, mayHaveOfficialMemorial } from "../../constants";
import { useProjectPermissions } from "../../hooks";

interface MemorialPageProps {
	projectId: string;
}

export const MemorialPage = ({ projectId }: MemorialPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const calculation = calculationQuery.data?.data;
	const exportSpreadsheet = useExportCalculationSpreadsheet();
	const memorialQuery = useGetMemorial(projectId, {
		enabled: calculation !== undefined,
	});
	const submissionQuery = useGetSubmission(projectId);

	const project = projectQuery.data?.data;
	const { canEdit } = useProjectPermissions(project);
	const reviewing = useWorkspaceReviewing();
	// Only a project out of edition can hold a stored memorial; the versions say which one.
	const checksVersions =
		project !== undefined && mayHaveOfficialMemorial(project.status);
	const versionsQuery = useGetProjectVersionList(projectId, {
		enabled: checksVersions,
	});
	const stamp =
		project === undefined || (checksVersions && !versionsQuery.data)
			? undefined
			: getMemorialStamp(project.status, versionsQuery.data?.data ?? []);
	const neverCalculated = calculationQuery.data === null;
	const outdated = getHttpStatus(memorialQuery.error) === 409;
	const hasError =
		projectQuery.isError ||
		calculationQuery.isError ||
		versionsQuery.isError ||
		(memorialQuery.isError && !outdated);

	const goTo = (to: "/projetos/$id/calculo" | "/projetos/$id/documentos") =>
		void navigate({ to, params: { id: projectId } });

	const exportCalculation = () =>
		exportSpreadsheet.mutate(projectId, {
			onSuccess: ({ blob, filename }) => downloadFile(blob, filename),
		});

	const content = hasError ? (
		<EmptyState
			title="Não foi possível gerar o memorial"
			description="Confira o aviso exibido e tente novamente."
			icon={CircleAlert}
			action={
				<div className="flex flex-wrap items-center justify-center gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							void projectQuery.refetch();
							void calculationQuery.refetch();
							void memorialQuery.refetch();
							if (versionsQuery.isError) void versionsQuery.refetch();
						}}
					>
						Tentar Novamente
					</Button>
					<CalculationExportButton blocker="error" />
				</div>
			}
		/>
	) : neverCalculated ? (
		<EmptyState
			title={
				canEdit
					? "Calcule a demanda antes de gerar o memorial"
					: "Este projeto não tem memorial"
			}
			description={
				canEdit
					? "O memorial é montado a partir do último cálculo de demanda do projeto."
					: "O projeto foi enviado sem passar pela memória de cálculo."
			}
			icon={Calculator}
			action={
				<div className="flex flex-wrap items-center justify-center gap-4">
					{canEdit ? (
						<Button
							type="button"
							variant="outline"
							onClick={() => goTo("/projetos/$id/calculo")}
						>
							Ir para o Cálculo
						</Button>
					) : null}
					<CalculationExportButton blocker="noCalculation" />
				</div>
			}
		/>
	) : outdated ? (
		<EmptyState
			title="Recalcule a demanda antes de gerar o memorial"
			description="Os dados do projeto mudaram depois do último cálculo."
			icon={Calculator}
			action={
				<div className="flex flex-wrap items-center justify-center gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => goTo("/projetos/$id/calculo")}
					>
						Ir para o Cálculo
					</Button>
					<CalculationExportButton blocker="outdated" />
				</div>
			}
		/>
	) : (
		<MemorialPreview
			project={project}
			stamp={stamp}
			calculation={calculation}
			memorial={memorialQuery.data}
			isLoading={memorialQuery.isPending}
			isExportingCalculation={exportSpreadsheet.isPending}
			onExportCalculation={exportCalculation}
		/>
	);

	return (
		<div className="flex flex-1 flex-col">
			<NormativeRevisionNotice fixedAt={calculation?.revisionsFixedAt} />
			{submissionQuery.isError ? (
				<div className="flex-1 px-6 py-8 md:px-10">{content}</div>
			) : (
				<div
					className={cn(
						"flex-1",
						reviewing
							? "flex flex-col"
							: "grid @5xl:grid-cols-[minmax(0,1fr)_400px]",
					)}
				>
					<div className="min-w-0 px-6 py-8 md:px-10">{content}</div>

					<SubmissionChecklistPanel
						projectId={projectId}
						checklist={submissionQuery.data?.data}
						isLoading={submissionQuery.isPending}
						editable={false}
						summary
						layout={reviewing ? "strip" : "panel"}
						className={
							reviewing
								? "order-first border-b border-border"
								: "border-t border-border @5xl:border-t-0 @5xl:border-l"
						}
					/>
				</div>
			)}

			{canEdit ? (
				<StepFooter
					previous={{
						label: "Cálculo de Demanda",
						onClick: () => goTo("/projetos/$id/calculo"),
					}}
				>
					<Button
						type="button"
						onClick={() => goTo("/projetos/$id/documentos")}
					>
						Ir para Documentos
						<ArrowRight aria-hidden="true" />
					</Button>
				</StepFooter>
			) : null}
		</div>
	);
};
