import { EmptyState } from "@components/EmptyState";
import { PageLayout } from "@components/layout";
import { Button } from "@components/ui/button";
import {
	useCalculateDemand,
	useGetLatestCalculation,
} from "@services/calculation";
import { useGetConsumerUnitGroupValidation } from "@services/consumer-units";
import { projectKeys, useGetProject } from "@services/projects";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Calculator, CircleAlert } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import {
	CalculationSteps,
	LoadComposition,
	ProjectStamp,
	ProjectStepper,
	TraceabilityPanel,
} from "../../components";

interface CalculationPageProps {
	projectId: string;
}

export const CalculationPage = ({ projectId }: CalculationPageProps) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const projectQuery = useGetProject(projectId);
	const validationQuery = useGetConsumerUnitGroupValidation(projectId);
	const project = projectQuery.data?.data;
	const validation = validationQuery.data?.data;
	const isDraft = project?.status === "DRAFT";
	const canCalculate = validation?.canCalculate ?? false;
	const latestQuery = useGetLatestCalculation(projectId, {
		enabled: project !== undefined && !isDraft,
	});
	const runQuery = useCalculateDemand(projectId, {
		enabled: isDraft && canCalculate,
	});

	// The listing shows the demand of the latest calculation.
	const calculatedAt = runQuery.dataUpdatedAt;
	useEffect(() => {
		if (calculatedAt === 0) return;
		void queryClient.invalidateQueries({ queryKey: projectKeys.all() });
	}, [calculatedAt, queryClient]);

	const result = isDraft ? runQuery.data?.data : latestQuery.data?.data;
	const isBlocked = isDraft && validation !== undefined && !canCalculate;
	const neverCalculated = latestQuery.data === null;
	const hasError =
		projectQuery.isError ||
		validationQuery.isError ||
		runQuery.isError ||
		latestQuery.isError;
	const isLoading = !result && !hasError && !isBlocked && !neverCalculated;

	const units = validation
		? `${validation.totalUnits} em ${validation.totalGroups} ${
				validation.totalGroups === 1 ? "grupo" : "grupos"
			}`
		: undefined;

	const backToUnits = () =>
		void navigate({ to: "/projetos/$id/unidades", params: { id: projectId } });

	const retry = () => {
		void projectQuery.refetch();
		void validationQuery.refetch();
		if (isDraft) {
			void runQuery.refetch();
		} else {
			void latestQuery.refetch();
		}
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
						Etapa 03 · Memória de cálculo
					</p>

					<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
						Cálculo de demanda
					</h1>
				</div>

				<ProjectStepper current={2} className="mt-6" />

				{isBlocked ? (
					<div className="flex-1 px-6 py-8 md:px-8">
						<EmptyState
							title="Pendências impedem o cálculo"
							description="Corrija os grupos marcados na etapa de unidades consumidoras para calcular a demanda."
							icon={CircleAlert}
							action={
								<Button type="button" variant="outline" onClick={backToUnits}>
									<ArrowLeft aria-hidden="true" />
									Voltar às unidades
								</Button>
							}
						/>
					</div>
				) : neverCalculated ? (
					<div className="flex-1 px-6 py-8 md:px-8">
						<EmptyState
							title="Este projeto não tem cálculo de demanda"
							description="O projeto foi enviado sem passar pela memória de cálculo."
							icon={Calculator}
						/>
					</div>
				) : hasError ? (
					<div className="flex-1 px-6 py-8 md:px-8">
						<EmptyState
							title="Não foi possível calcular a demanda"
							description="Confira o aviso exibido e tente novamente."
							icon={CircleAlert}
							action={
								<Button type="button" variant="outline" onClick={retry}>
									Tentar novamente
								</Button>
							}
						/>
					</div>
				) : (
					<div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_440px]">
						<div className="flex flex-col gap-10 px-6 py-8 md:px-8">
							<CalculationSteps steps={result?.steps} isLoading={isLoading} />
							<LoadComposition
								composition={result?.composition}
								calculatedKva={result?.totals.calculatedKva}
								isLoading={isLoading}
							/>
						</div>

						<TraceabilityPanel
							calculation={result}
							isLoading={isLoading}
							className="border-t border-border lg:border-t-0 lg:border-l"
						/>
					</div>
				)}

				<div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 md:px-8">
					<Button
						type="button"
						variant="outline"
						size="icon"
						aria-label="Voltar para Unidades consumidoras"
						onClick={backToUnits}
					>
						<ArrowLeft aria-hidden="true" />
					</Button>

					<Button
						type="button"
						disabled={!result}
						onClick={() => toast.info("O memorial chega na próxima etapa.")}
					>
						Gerar memorial
						<ArrowRight aria-hidden="true" />
					</Button>
				</div>
			</div>
		</PageLayout>
	);
};
