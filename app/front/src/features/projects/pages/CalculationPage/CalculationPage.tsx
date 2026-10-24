import { EmptyState } from "@components/EmptyState";
import { Button } from "@components/ui/button";
import {
	useGetLatestCalculation,
	useRunCalculation,
} from "@services/calculation";
import { useGetConsumerUnitGroupValidation } from "@services/consumer-units";
import { useGetFindingList } from "@services/project-review";
import { useGetProject } from "@services/projects";
import { useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	ArrowRight,
	Calculator,
	CircleAlert,
	RefreshCw,
} from "lucide-react";

import {
	AutomaticVerification,
	CalculationSteps,
	LoadComposition,
	StageFindingsNotice,
	StepFooter,
	TraceabilityPanel,
	useFindingRegistrar,
} from "../../components";
import { stageFindingsOf } from "../../constants";
import { useProjectPermissions } from "../../hooks";

interface CalculationPageProps {
	projectId: string;
}

export const CalculationPage = ({ projectId }: CalculationPageProps) => {
	const navigate = useNavigate();
	const projectQuery = useGetProject(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const latestQuery = useGetLatestCalculation(projectId);
	const run = useRunCalculation();
	const registrar = useFindingRegistrar();
	const project = projectQuery.data?.data;
	const findingsQuery = useGetFindingList(projectId, {
		enabled: project?.status === "REJECTED",
	});
	const stageFindings = stageFindingsOf(
		findingsQuery.data?.data,
		project,
		"CALCULATION",
	);
	const validation = validationQuery.data?.data;
	const { canEdit: isEditable } = useProjectPermissions(project);
	const canCalculate = validation?.canCalculate ?? false;

	const result = latestQuery.data?.data;
	const neverCalculated = latestQuery.data === null;
	const outdated = isEditable && result?.outdated === true;
	const isBlocked =
		isEditable && validation !== undefined && !canCalculate && !result;
	const hasError =
		projectQuery.isError || validationQuery.isError || latestQuery.isError;
	const isLoading = latestQuery.isPending && !hasError;

	const calculate = () => run.mutate(projectId);

	const backToUnits = () =>
		void navigate({ to: "/projetos/$id/unidades", params: { id: projectId } });

	const retry = () => {
		void projectQuery.refetch();
		void validationQuery.refetch();
		void latestQuery.refetch();
	};

	return (
		<div className="flex flex-1 flex-col">
			{outdated ? (
				<div
					role="status"
					className="mx-6 mt-6 flex flex-col gap-3 rounded-xs border border-border border-l-4 border-l-brand-sunset px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:mx-8"
				>
					<p className="text-sm">
						Os dados do projeto mudaram depois deste cálculo. Recalcule para
						atualizar a memória e o memorial.
					</p>
					<Button
						type="button"
						size="sm"
						className="shrink-0"
						disabled={!canCalculate || run.isPending}
						onClick={calculate}
					>
						<RefreshCw aria-hidden="true" />
						{run.isPending ? "Recalculando..." : "Recalcular"}
					</Button>
				</div>
			) : null}

			<StageFindingsNotice
				projectId={projectId}
				findings={stageFindings}
				references={Object.fromEntries(
					(result?.steps ?? []).map((step) => [step.code, step.title]),
				)}
				className="mt-6"
			/>

			{isBlocked ? (
				<div className="flex-1 px-6 py-8 md:px-8">
					<EmptyState
						title="Pendências impedem o cálculo"
						description="Corrija os grupos marcados na seção de unidades consumidoras para calcular a demanda."
						icon={CircleAlert}
						action={
							<Button type="button" variant="outline" onClick={backToUnits}>
								<ArrowLeft aria-hidden="true" />
								Voltar às Unidades
							</Button>
						}
					/>
				</div>
			) : hasError ? (
				<div className="flex-1 px-6 py-8 md:px-8">
					<EmptyState
						title="Não foi possível carregar o cálculo"
						description="Confira o aviso exibido e tente novamente."
						icon={CircleAlert}
						action={
							<Button type="button" variant="outline" onClick={retry}>
								Tentar Novamente
							</Button>
						}
					/>
				</div>
			) : neverCalculated ? (
				<div className="flex-1 px-6 py-8 md:px-8">
					<EmptyState
						title={
							isEditable
								? "Calcule a demanda do projeto"
								: "Este projeto não tem cálculo de demanda"
						}
						description={
							isEditable
								? "O cálculo usa os dados da edificação e as unidades cadastradas. Refaça sempre que mudar esses dados."
								: "O projeto foi enviado sem passar pela memória de cálculo."
						}
						icon={Calculator}
						action={
							isEditable ? (
								<Button
									type="button"
									disabled={!canCalculate || run.isPending}
									onClick={calculate}
								>
									<Calculator aria-hidden="true" />
									{run.isPending ? "Calculando..." : "Calcular Demanda"}
								</Button>
							) : undefined
						}
					/>
				</div>
			) : (
				<div className="grid flex-1 @5xl:grid-cols-[minmax(0,1fr)_440px]">
					<div className="flex flex-col gap-10 px-6 py-8 md:px-8">
						<AutomaticVerification
							checks={result?.checks}
							isLoading={isLoading}
							onCreateFinding={registrar.onCheck}
						/>
						<CalculationSteps
							steps={result?.steps}
							findings={stageFindings}
							isLoading={isLoading}
						/>
						<LoadComposition
							composition={result?.composition}
							calculatedKva={result?.totals.calculatedKva}
							isLoading={isLoading}
						/>
					</div>

					<TraceabilityPanel
						calculation={result}
						isLoading={isLoading}
						className="border-t border-border @5xl:border-t-0 @5xl:border-l"
					/>
				</div>
			)}

			{isEditable ? (
				<StepFooter
					previous={{ label: "Unidades Consumidoras", onClick: backToUnits }}
				>
					<Button
						type="button"
						disabled={!result || outdated}
						onClick={() =>
							void navigate({
								to: "/projetos/$id/documentos",
								params: { id: projectId },
							})
						}
					>
						Ir para Documentos
						<ArrowRight aria-hidden="true" />
					</Button>
				</StepFooter>
			) : null}
		</div>
	);
};
