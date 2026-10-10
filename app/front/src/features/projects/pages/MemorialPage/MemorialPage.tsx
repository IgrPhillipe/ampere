import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import { useGetLatestCalculation } from "@services/calculation";
import { useGetConsumerUnitGroupValidation } from "@services/consumer-units";
import { useGetProject } from "@services/projects";
import {
	type DocumentType,
	type ProjectDocument,
	useDeleteDocument,
	useGetMemorial,
	useGetSubmission,
	useSubmitProject,
	useUploadDocument,
} from "@services/submission";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calculator, CircleAlert } from "lucide-react";

import {
	MemorialPreview,
	ProjectStamp,
	ProjectStepper,
	SubmissionChecklistPanel,
} from "../../components";

interface MemorialPageProps {
	projectId: string;
}

export const MemorialPage = ({ projectId }: MemorialPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const submissionQuery = useGetSubmission(projectId);
	const calculation = calculationQuery.data?.data;
	const memorialQuery = useGetMemorial(projectId, {
		enabled: calculation !== undefined,
	});
	const uploadMutation = useUploadDocument();
	const deleteMutation = useDeleteDocument();
	const submitMutation = useSubmitProject();

	const project = projectQuery.data?.data;
	const validation = validationQuery.data?.data;
	const checklist = submissionQuery.data?.data;
	const editable =
		project?.status === "DRAFT" || project?.status === "AWAITING_SUBMISSION";
	const submitted = project !== undefined && !editable;
	const neverCalculated = calculationQuery.data === null;
	const hasError =
		projectQuery.isError ||
		calculationQuery.isError ||
		submissionQuery.isError ||
		memorialQuery.isError;

	const units = validation
		? `${validation.totalUnits} em ${validation.totalGroups} ${
				validation.totalGroups === 1 ? "grupo" : "grupos"
			}`
		: undefined;

	const backToCalculation = () =>
		void navigate({ to: "/projetos/$id/calculo", params: { id: projectId } });

	const goToSubmission = () =>
		void navigate({ to: "/projetos/$id/envio", params: { id: projectId } });

	const upload = (type: DocumentType, file: File) =>
		uploadMutation.mutate({ projectId, type, file });

	const remove = (document: ProjectDocument) =>
		deleteMutation.mutate({ projectId, documentId: document.id });

	const submit = () =>
		submitMutation.mutate(projectId, { onSuccess: goToSubmission });

	const retry = () => {
		void projectQuery.refetch();
		void calculationQuery.refetch();
		void submissionQuery.refetch();
		void memorialQuery.refetch();
	};

	return (
		<PageLayout
			bleed
			className="mx-auto min-h-full w-full max-w-page pb-0 md:pb-0"
		>
			<div className="flex flex-1 flex-col bg-card">
				<ProjectStamp
					project={project}
					isLoading={projectQuery.isPending || validationQuery.isPending}
					units={units}
				/>

				<div className="px-6 pt-8 md:px-8">
					<p className="text-xs tracking-wider text-muted-foreground uppercase">
						Etapa 04 de 05
					</p>

					<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
						Memorial
					</h1>
				</div>

				<ProjectStepper current={3} className="mt-6" />

				{neverCalculated ? (
					<div className="flex-1 px-6 py-8 md:px-8">
						<EmptyState
							title="Calcule a demanda antes de gerar o memorial"
							description="O memorial é montado a partir do último cálculo de demanda do projeto."
							icon={Calculator}
							action={
								<Button
									type="button"
									variant="outline"
									onClick={backToCalculation}
								>
									<ArrowLeft aria-hidden="true" />
									Voltar ao Cálculo
								</Button>
							}
						/>
					</div>
				) : hasError ? (
					<div className="flex-1 px-6 py-8 md:px-8">
						<EmptyState
							title="Não foi possível gerar o memorial"
							description="Confira o aviso exibido e tente novamente."
							icon={CircleAlert}
							action={
								<Button type="button" variant="outline" onClick={retry}>
									Tentar Novamente
								</Button>
							}
						/>
					</div>
				) : (
					<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_400px]">
						<MemorialPreview
							project={project}
							calculation={calculation}
							memorial={memorialQuery.data}
							isLoading={memorialQuery.isPending}
							className="px-6 py-8 md:px-8"
						/>

						<SubmissionChecklistPanel
							checklist={checklist}
							isLoading={submissionQuery.isPending}
							editable={editable}
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
							className="border-t border-border lg:border-t-0 lg:border-l"
						/>
					</div>
				)}

				<div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 md:px-8">
					<Button
						type="button"
						variant="outline"
						size="icon"
						aria-label="Voltar para Cálculo de Demanda"
						onClick={backToCalculation}
					>
						<ArrowLeft aria-hidden="true" />
					</Button>

					{submitted ? (
						<Button type="button" onClick={goToSubmission}>
							Ver Envio
							<ArrowRight aria-hidden="true" />
						</Button>
					) : (
						<Button
							type="button"
							disabled={!checklist?.canSubmit || submitMutation.isPending}
							onClick={submit}
						>
							Enviar para Análise
							<ArrowRight aria-hidden="true" />
						</Button>
					)}
				</div>
			</div>
		</PageLayout>
	);
};
