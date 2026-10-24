import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { useGetFindingList } from "@services/project-review";
import { useGetProject } from "@services/projects";
import {
	type DocumentType,
	type ProjectDocument,
	useDeleteDocument,
	useGetSubmission,
	useUploadDocument,
} from "@services/submission";
import { CircleAlert } from "lucide-react";

import {
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
	const projectQuery = useGetProject(projectId);
	const submissionQuery = useGetSubmission(projectId);
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

	const upload = (type: DocumentType, file: File) =>
		uploadMutation.mutate({ projectId, type, file });

	const remove = (document: ProjectDocument) =>
		deleteMutation.mutate({ projectId, documentId: document.id });

	if (projectQuery.isError || submissionQuery.isError) {
		return (
			<div className="flex-1 px-6 py-8 md:px-8">
				<EmptyState
					title="Não foi possível carregar os documentos"
					description="Confira o aviso exibido e tente novamente."
					icon={CircleAlert}
					action={
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								void projectQuery.refetch();
								void submissionQuery.refetch();
							}}
						>
							Tentar Novamente
						</Button>
					}
				/>
			</div>
		);
	}

	const attached = (
		<section aria-labelledby="anexos-titulo" className="flex flex-col gap-4">
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
				emptyDescription={
					editable
						? "Anexe a ART, o diagrama unifilar e a planta de situação na checagem ao lado."
						: undefined
				}
			/>
		</section>
	);

	return (
		<div className="flex flex-1 flex-col">
			<StageFindingsNotice
				projectId={projectId}
				findings={documentFindings}
				documents={checklist?.documents}
				references={Object.fromEntries(
					(checklist?.items ?? []).map((item) => [item.key, item.label]),
				)}
				className="my-6"
			/>

			{editable ? (
				<div className="grid flex-1 @5xl:grid-cols-[minmax(0,1fr)_400px]">
					<div className="min-w-0 px-6 py-8 md:px-8">{attached}</div>

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
				<div className="flex-1 px-6 py-8 md:px-8">{attached}</div>
			)}
		</div>
	);
};
