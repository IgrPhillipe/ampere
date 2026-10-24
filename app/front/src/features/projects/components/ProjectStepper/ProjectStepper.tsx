import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import { useGetLatestCalculation } from "@services/calculation";
import { useGetConsumerUnitGroupValidation } from "@services/consumer-units";
import { useGetProject } from "@services/projects";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { unlockedStepOf } from "./project-steps";

const PROJECT_STAGES = [
	{ label: "Dados da Edificação", to: "/projetos/$id/dados" },
	{ label: "Unidades Consumidoras", to: "/projetos/$id/unidades" },
	{ label: "Cálculo de Demanda", to: "/projetos/$id/calculo" },
	{ label: "Memorial", to: "/projetos/$id/memorial" },
	{ label: "Envio", to: "/projetos/$id/envio" },
] as const;

const useUnlockedThrough = (projectId: string | undefined) => {
	const enabled = projectId !== undefined;
	const id = projectId ?? "";
	const project = useGetProject(id, { enabled }).data?.data;
	const validation = useGetConsumerUnitGroupValidation(id, { enabled }).data
		?.data;
	const calculation = useGetLatestCalculation(id, { enabled }).data;

	return enabled
		? unlockedStepOf({
				status: project?.status,
				canCalculate: validation?.canCalculate,
				hasCalculation: Boolean(calculation),
			})
		: -1;
};

interface ProjectStepperProps {
	current: number;
	/** Absent while the project is being created: no step opens yet. */
	projectId?: string;
	className?: string;
}

export const ProjectStepper = ({
	current,
	projectId,
	className,
}: ProjectStepperProps) => {
	const unlockedThrough = useUnlockedThrough(projectId);

	return (
		<nav
			aria-label="Etapas do projeto"
			className={cn("border-b border-border px-6 md:px-8", className)}
		>
			{/* `overflow-x-auto`: com `hidden` os nomes das etapas eram cortados
		    em largura de celular, sem forma de chegar neles. */}
			<ol className="flex overflow-x-auto">
				{PROJECT_STAGES.map(({ label, to }, index) => {
					const isCurrent = index === current;
					// A step is done once the next one opens; a submitted project has done them all.
					const isDone =
						index < unlockedThrough ||
						unlockedThrough === PROJECT_STAGES.length - 1;
					const canOpen =
						projectId !== undefined && !isCurrent && index <= unlockedThrough;
					const content = (
						<>
							<span className="font-mono text-xs">{padCount(index + 1)}</span>
							{label}
							{isDone ? (
								<>
									<Check aria-hidden="true" className="size-3.5" />
									<span className="sr-only">(concluída)</span>
								</>
							) : null}
						</>
					);

					return (
						<li
							key={label}
							aria-current={isCurrent ? "step" : undefined}
							className={cn(
								"group/step relative flex flex-1 border-b-2 text-sm whitespace-nowrap",
								"not-first:before:absolute not-first:before:top-1/2 not-first:before:left-0 not-first:before:h-5 not-first:before:w-px not-first:before:-translate-y-1/2 not-first:before:bg-border",
								isCurrent
									? "border-foreground font-medium text-foreground"
									: "border-transparent",
								!isCurrent &&
									(isDone ? "text-foreground" : "text-muted-foreground"),
							)}
						>
							{canOpen ? (
								<Link
									to={to}
									params={{ id: projectId }}
									className="flex flex-1 items-center gap-2 px-3 py-3 transition-colors group-first/step:pl-1 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
								>
									{content}
								</Link>
							) : (
								<span
									className={cn(
										"flex flex-1 items-center gap-2 px-3 py-3 group-first/step:pl-1",
										!isCurrent && "cursor-not-allowed",
									)}
								>
									{content}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};
