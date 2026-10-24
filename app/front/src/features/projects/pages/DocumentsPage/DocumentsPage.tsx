import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { getHttpStatus } from "@lib/api-error";
import { useGetLatestCalculation } from "@services/calculation";
import { useGetFindingList } from "@services/project-review";
import { useGetProject } from "@services/projects";
import {
	type DocumentType,
	type ProjectDocument,
	useDeleteDocument,
	useGetMemorial,
	useGetSubmission,
	useUploadDocument,
} from "@services/submission";
import { useNavigate } from "@tanstack/react-router";
import { Calculator, CircleAlert } from "lucide-react";

import {
	MemorialPreview,
	ProjectDocuments,
	StageFindingsNotice,
	SubmissionChecklistPanel,
	useFindingRegistrar,
} from "../../components";
import { stageFindingsOf } from "../../constants";
import { useProjectPermissions } from "../../hooks";

interface DocumentsPageProps {
	projectId: string;
}

export const DocumentsPage = ({ projectId }: DocumentsPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const submissionQuery = useGetSubmission(projectId);
	const calculation = calculationQuery.data?.data;
	const memorialQuery = useGetMemorial(projectId, {
		enabled: calculation !== undefined,
	});
	const uploadMutation = useUploadDocument();
	const deleteMutation = useDeleteDocument();
	const registrar = useFindingRegistrar();

	const project = projectQuery.data?.data;
	const findingsQuery = useGetFindingList(projectId, {
		enabled: project?.status === "REJECTED",
	});
	const documentFindings = stageFindingsOf(
		findingsQuery.data?.data,
		project,
		"DOCUMENTS",
	);
	const checklist = submissionQuery.data?.data;
	const { canEditDocuments: editable } = useProjectPermissions(project);
	const neverCalculated = calculationQuery.data === null;
	const outdated = getHttpStatus(memorialQuery.error) === 409;
	const hasError =
		projectQuery.isError ||
		calculationQuery.isError ||
		submissionQuery.isError ||
		(memorialQuery.isError && !outdated);

	const goToCalculation = () =>
		void navigate({ to: "/projetos/$id/calculo", params: { id: projectId } });

	const upload = (type: DocumentType, file: File) =>
		uploadMutation.mutate({ projectId, type, file });

	const remove = (document: ProjectDocument) =>
		deleteMutation.mutate({ projectId, documentId: document.id });

	const retry = () => {
		void projectQuery.refetch();
		void calculationQuery.refetch();
		void submissionQuery.refetch();
		void memorialQuery.refetch();
	};

	const memorial = neverCalculated ? (
		<EmptyState
			title={
				editable
					? "Calcule a demanda antes de gerar o memorial"
					: "Este projeto não tem memorial"
			}
			description={
				editable
					? "O memorial é montado a partir do último cálculo de demanda do projeto."
					: "O projeto foi enviado sem passar pela memória de cálculo."
			}
			icon={Calculator}
			action={
				editable ? (
					<Button type="button" variant="outline" onClick={goToCalculation}>
						Ir para o Cálculo
					</Button>
				) : undefined
			}
		/>
	) : outdated ? (
		<EmptyState
			title="Recalcule a demanda antes de gerar o memorial"
			description="Os dados do projeto mudaram depois do último cálculo."
			icon={Calculator}
			action={
				<Button type="button" variant="outline" onClick={goToCalculation}>
					Ir para o Cálculo
				</Button>
			}
		/>
	) : (
		<MemorialPreview
			project={project}
			calculation={calculation}
			memorial={memorialQuery.data}
			isLoading={memorialQuery.isPending}
		/>
	);

	if (hasError) {
		return (
			<div className="flex-1 px-6 py-8 md:px-8">
				<EmptyState
					title="Não foi possível carregar os documentos"
					description="Confira o aviso exibido e tente novamente."
					icon={CircleAlert}
					action={
						<Button type="button" variant="outline" onClick={retry}>
							Tentar Novamente
						</Button>
					}
				/>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col">
			<StageFindingsNotice
				projectId={projectId}
				findings={documentFindings}
				documents={checklist?.documents}
				references={Object.fromEntries(
					(checklist?.items ?? []).map((item) => [item.key, item.label]),
				)}
				className="mt-6"
			/>

			{editable ? (
				<div className="grid flex-1 @5xl:grid-cols-[minmax(0,1fr)_400px]">
					<div className="px-6 py-8 md:px-8">{memorial}</div>

					<SubmissionChecklistPanel
						projectId={projectId}
						checklist={checklist}
						findings={documentFindings}
						isLoading={submissionQuery.isPending}
						editable
						uploadingType={
							uploadMutation.isPending
								? uploadMutation.variables?.type
								: undefined
						}
						removingId={
							deleteMutation.isPending
								? deleteMutation.variables?.documentId
								: undefined
						}
						onUpload={upload}
						onRemove={remove}
						className="order-first border-b border-border @5xl:order-none @5xl:border-b-0 @5xl:border-l"
					/>
				</div>
			) : (
				<div className="flex flex-1 flex-col gap-10 px-6 py-8 md:px-8">
					<section
						aria-labelledby="anexos-titulo"
						className="flex flex-col gap-4"
					>
						<h2
							id="anexos-titulo"
							className="border-b-2 border-foreground pb-3 text-lg font-semibold text-foreground"
						>
							Documentos Anexados
						</h2>
						<ProjectDocuments
							projectId={projectId}
							documents={checklist?.documents}
							onCreateFinding={registrar.onDocument}
						/>
					</section>

					{memorial}
				</div>
			)}
		</div>
	);
};
