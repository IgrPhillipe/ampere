import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import { getHttpStatus } from "@lib/api-error";
import { useGetLatestCalculation } from "@services/calculation";
import { useGetProject } from "@services/projects";
import { useGetMemorial } from "@services/submission";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Calculator, CircleAlert } from "lucide-react";

import { MemorialPreview, StepFooter } from "../../components";
import { useProjectPermissions } from "../../hooks";

interface MemorialPageProps {
	projectId: string;
}

export const MemorialPage = ({ projectId }: MemorialPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const calculationQuery = useGetLatestCalculation(projectId);
	const calculation = calculationQuery.data?.data;
	const memorialQuery = useGetMemorial(projectId, {
		enabled: calculation !== undefined,
	});

	const project = projectQuery.data?.data;
	const { canEdit } = useProjectPermissions(project);
	const neverCalculated = calculationQuery.data === null;
	const outdated = getHttpStatus(memorialQuery.error) === 409;
	const hasError =
		projectQuery.isError ||
		calculationQuery.isError ||
		(memorialQuery.isError && !outdated);

	const goTo = (to: "/projetos/$id/calculo" | "/projetos/$id/documentos") =>
		void navigate({ to, params: { id: projectId } });

	const content = hasError ? (
		<EmptyState
			title="Não foi possível gerar o memorial"
			description="Confira o aviso exibido e tente novamente."
			icon={CircleAlert}
			action={
				<Button
					type="button"
					variant="outline"
					onClick={() => {
						void projectQuery.refetch();
						void calculationQuery.refetch();
						void memorialQuery.refetch();
					}}
				>
					Tentar Novamente
				</Button>
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
				canEdit ? (
					<Button
						type="button"
						variant="outline"
						onClick={() => goTo("/projetos/$id/calculo")}
					>
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
				<Button
					type="button"
					variant="outline"
					onClick={() => goTo("/projetos/$id/calculo")}
				>
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

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex-1 px-6 py-8 md:px-8">{content}</div>

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
