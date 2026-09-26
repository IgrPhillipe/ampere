import { padCount } from "@features/shared";
import { cn } from "@lib/utils";
import { Check } from "lucide-react";

const PROJECT_STAGES = [
	"Dados da edificação",
	"Unidades consumidoras",
	"Cálculo de demanda",
	"Memorial",
	"Envio",
];

interface ProjectStepperProps {
	/** Indice da etapa atual, a partir de 0. As anteriores aparecem concluidas. */
	current: number;
	className?: string;
}

/** Indice das cinco etapas do projeto, o mesmo em todas as telas do fluxo. */
export const ProjectStepper = ({ current, className }: ProjectStepperProps) => (
	<nav
		aria-label="Etapas do projeto"
		className={cn("border-b border-border px-6 md:px-8", className)}
	>
		{/* `overflow-x-auto`: com `hidden` os nomes das etapas eram cortados
		    em largura de celular, sem forma de chegar neles. */}
		<ol className="flex overflow-x-auto">
			{PROJECT_STAGES.map((label, index) => {
				const isCurrent = index === current;
				const isDone = index < current;

				return (
					<li
						key={label}
						aria-current={isCurrent ? "step" : undefined}
						className={cn(
							"relative flex flex-1 items-center gap-2 border-b-2 px-3 py-3 text-sm whitespace-nowrap first:pl-1",
							"not-first:before:absolute not-first:before:top-1/2 not-first:before:left-0 not-first:before:h-5 not-first:before:w-px not-first:before:-translate-y-1/2 not-first:before:bg-border",
							isCurrent
								? "border-foreground font-medium text-foreground"
								: "border-transparent",
							isDone && "text-foreground",
							!isCurrent && !isDone && "text-muted-foreground",
						)}
					>
						<span className="font-mono text-xs">{padCount(index + 1)}</span>
						{label}
						{isDone ? (
							<>
								<Check aria-hidden="true" className="size-3.5" />
								<span className="sr-only">(concluída)</span>
							</>
						) : null}
					</li>
				);
			})}
		</ol>
	</nav>
);
