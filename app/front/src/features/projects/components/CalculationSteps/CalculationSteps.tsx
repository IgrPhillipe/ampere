import { Skeleton } from "@components/ui/skeleton";
import { formatDecimal, padCount } from "@features/shared";
import { cn } from "@lib/utils";
import type { CalculationStep } from "@services/calculation";
import { useState } from "react";

import { demandSeriesClassNames } from "../../constants";

interface CalculationStepsProps {
	steps?: CalculationStep[];
	isLoading?: boolean;
	className?: string;
}

const STEP_COUNT = 5;

export const CalculationSteps = ({
	steps,
	isLoading = false,
	className,
}: CalculationStepsProps) => (
	<section aria-labelledby="etapas-titulo" className={className}>
		<div className="flex items-baseline justify-between gap-4 border-b-2 border-foreground pb-3">
			<h2 id="etapas-titulo" className="text-lg font-semibold text-foreground">
				Decomposição do cálculo
			</h2>
			<span className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
				{padCount(steps?.length ?? STEP_COUNT)} etapas
			</span>
		</div>

		{isLoading || !steps ? (
			<ol aria-busy="true" className="flex flex-col">
				{Array.from({ length: STEP_COUNT }, (_, index) => (
					<li
						key={index}
						className="grid grid-cols-[3.25rem_minmax(0,1fr)_8.75rem] items-start gap-y-2 border-b border-border py-3"
					>
						<Skeleton className="h-4 w-6" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-5 w-64" />
							<Skeleton className="h-4 w-80 max-w-full" />
						</div>
						<Skeleton className="ml-auto h-6 w-20" />
					</li>
				))}
			</ol>
		) : (
			<ol className="flex flex-col">
				{steps.map((step) => (
					<StepRow key={step.code} step={step} />
				))}
			</ol>
		)}
	</section>
);

const StepRow = ({ step }: { step: CalculationStep }) => {
	const [isOpen, setIsOpen] = useState(false);
	const isTotal = step.code === "Ded";
	// The band of Tabela 1 or 2 explains why the total differs from the sum.
	const [lead, ...rest] = isTotal ? step.details : [undefined, ...step.details];
	const detailsId = `etapa-${step.code}-detalhes`;

	return (
		<li
			className={cn(
				"grid grid-cols-[3.25rem_minmax(0,1fr)] gap-y-1 border-b border-border py-3 sm:grid-cols-[3.25rem_minmax(0,1fr)_8.75rem]",
				isTotal && "rounded-xs border-b-0 bg-accent px-3.5",
			)}
		>
			<span className="flex h-6 items-center gap-2.5">
				<span
					aria-hidden="true"
					className={cn(
						"size-2 rounded-[2px]",
						demandSeriesClassNames[step.code],
					)}
				/>
				<span
					className={cn(
						"font-mono text-sm",
						isTotal ? "text-foreground" : "text-muted-foreground",
					)}
				>
					{padCount(step.index)}
				</span>
			</span>

			<div className="flex min-w-0 flex-col gap-1">
				<h3 className="text-base font-medium text-foreground">
					{step.title}
					<span className="sr-only"> ({step.code})</span>
				</h3>
				<p className="font-mono text-xs break-words text-muted-foreground">
					{step.formula}
				</p>
				{lead ? (
					<p className="font-mono text-xs text-foreground">{lead}</p>
				) : null}

				{rest.length > 0 ? (
					<>
						<button
							type="button"
							aria-expanded={isOpen}
							aria-controls={detailsId}
							onClick={() => setIsOpen((open) => !open)}
							className="self-start text-xs text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							{isOpen ? "Ocultar detalhes" : "Ver detalhes"}
						</button>
						<ul
							id={detailsId}
							hidden={!isOpen}
							className="mt-1 flex flex-col gap-1 border-l border-border pl-3"
						>
							{rest.map((line, index) => (
								<li
									key={`${index}-${line}`}
									className="font-mono text-xs text-muted-foreground"
								>
									{line}
								</li>
							))}
						</ul>
					</>
				) : null}
			</div>

			<div className="col-start-2 flex flex-col items-start gap-1 sm:col-start-3 sm:items-end">
				<p className="flex items-baseline gap-1.5 whitespace-nowrap">
					<span className="font-mono text-xl font-semibold tracking-tight text-foreground">
						{step.applies ? formatDecimal(step.valueKva) : "—"}
					</span>
					{step.applies ? (
						<span className="text-sm text-muted-foreground">kVA</span>
					) : null}
				</p>
				{step.reference ? (
					<span
						className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase"
						title={`${step.reference.standard} ${step.reference.revision}, ${step.reference.item}, p. ${step.reference.page}`}
					>
						{step.reference.label}
					</span>
				) : null}
			</div>
		</li>
	);
};
