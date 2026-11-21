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
import { useState } from "react";

import {
	FixFindingPrompt,
	type FixFindingQueue,
	ProjectDocuments,
	StageFindingsNotice,
	SubmissionChecklistPanel,
	useFindingRegistrar,
} from "../../components";
import { stageFindingsOf } from "../../constants";
import { useProjectDetailActions, useProjectPermissions } from "../../hooks";

interface DocumentsPageProps {
	projectId: string;
}

export const DocumentsPage = ({ projectId }: DocumentsPageProps) => {
	const projectQuery = useGetProject(projectId);
	const submissionQuery = useGetSubmission(projectId);
	const uploadMutation = useUploadDocument();
	const deleteMutation = useDeleteDocument();
	const registrar = useFindingRegistrar();
	const [fixQueue, setFixQueue] = useState<FixFindingQueue | null>(null);

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
	const { respondFindings: canRespond } = useProjectDetailActions({
		status: project?.status,
		ownerId: project?.ownerId,
	});

	const upload = (type: DocumentType, file: File) => {
		const pointed = canRespond
			? documentFindings.filter((finding) => finding.documentType === type)
			: [];
		const replacing = (checklist?.documents ?? []).some(
			(document) => document.type === type,
		);

		uploadMutation.mutate(
			{ projectId, type, file },
			{
				onSuccess: ({ data }) => {
					if (pointed.length > 0)
						setFixQueue({
							findings: pointed,
							suggestion: `${replacing ? "Substituí" : "Anexei"} o documento ${data.typeLabel}.`,
						});
				},
			},
		);
	};

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
				<SubmissionChecklistPanel
					projectId={projectId}
					checklist={checklist}
					findings={documentFindings}
					isLoading={submissionQuery.isPending}
					editable
					layout="page"
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

			<FixFindingPrompt
				projectId={projectId}
				queue={fixQueue}
				onQueueChange={setFixQueue}
			/>
		</div>
	);
};
