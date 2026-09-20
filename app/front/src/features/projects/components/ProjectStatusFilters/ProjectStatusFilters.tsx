import type { ProjectStatusCounts } from "@services/projects";

import type { ProjectStatusFilter } from "../../types";

interface ProjectStatusFiltersProps {
	counts: ProjectStatusCounts;
	value: ProjectStatusFilter;
	onValueChange: (value: ProjectStatusFilter) => void;
}

const statusFilters = [
	{ value: "ALL", label: "Todos os projetos", countKey: "total" },
	{ value: "DRAFT", label: "Rascunho", countKey: "draft" },
	{
		value: "AWAITING_SUBMISSION",
		label: "Aguardando envio",
		countKey: "awaitingSubmission",
	},
	{
		value: "UNDER_REVIEW",
		label: "Em análise",
		countKey: "underReview",
	},
	{ value: "REJECTED", label: "Reprovado", countKey: "rejected" },
	{ value: "APPROVED", label: "Aprovado", countKey: "approved" },
] as const satisfies ReadonlyArray<{
	value: ProjectStatusFilter;
	label: string;
	countKey: keyof ProjectStatusCounts;
}>;

const formatCount = (count: number) => String(count).padStart(2, "0");

export const ProjectStatusFilters = ({
	counts,
	value,
	onValueChange,
}: ProjectStatusFiltersProps) => (
	<div
		role="group"
		className="overflow-x-auto bg-primary text-primary-foreground"
		aria-label="Filtrar projetos por situação"
	>
		<div className="grid min-w-4xl grid-cols-6">
			{statusFilters.map((filter) => {
				const isActive = value === filter.value;

				return (
					<button
						key={filter.value}
						type="button"
						aria-pressed={isActive}
						onClick={() => onValueChange(filter.value)}
						className="group relative flex min-h-30 flex-col justify-center gap-2 border-r border-primary-foreground/20 pr-5 pl-12 text-left last:border-r-0 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none"
					>
						<span className="font-mono text-4xl font-semibold">
							{formatCount(counts[filter.countKey])}
						</span>
						<span className="font-mono text-xs tracking-wider uppercase opacity-80">
							{filter.label}
						</span>
						<span
							className="absolute inset-x-4 bottom-4 h-0.5 bg-primary-foreground opacity-0 transition-opacity group-hover:opacity-70 data-active:opacity-100"
							data-active={isActive || undefined}
						/>
					</button>
				);
			})}
		</div>
	</div>
);
