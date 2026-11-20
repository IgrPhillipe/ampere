import { EmptyState } from "@components/EmptyState";
import { SectionHeading } from "@components/SectionHeading";
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
				// The checklist is the single list while the designer can still edit.
				<SubmissionChecklistPanel
					projectId={projectId}
					checklist={checklist}
					findings={documentFindings}
					isLoading={submissionQuery.isPending}
					editable
					as="section"
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
					className="w-full max-w-3xl flex-1 md:px-10"
				/>
			) : (
				<section
					aria-labelledby="anexos-titulo"
					className="flex flex-1 flex-col gap-5 px-6 py-8 md:px-10"
				>
					<SectionHeading id="anexos-titulo">
						Documentos Anexados
					</SectionHeading>
					<ProjectDocuments
						projectId={projectId}
						documents={checklist?.documents}
						onCreateFinding={registrar.onDocument}
					/>
				</section>
			)}
		</div>
	);
};
