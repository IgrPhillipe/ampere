import { cn } from "@lib/utils";
import {
	type ProjectStatus,
	type ProjectStatusCounts,
	projectStatusSchema,
} from "@services/projects";

import { projectStatusCountKeys, projectStatusLabels } from "../../constants";

interface ProjectStatusFiltersProps {
	counts: ProjectStatusCounts;
	/** `null` is the "Todos os projetos" chip. */
	value: ProjectStatus | null;
	onValueChange: (value: ProjectStatus | null) => void;
	className?: string;
}

interface StatusFilter {
	value: ProjectStatus | null;
	label: string;
	countKey: keyof ProjectStatusCounts;
}

/** Order comes from the enum: the schema is the source, not a literal copy. */
const statusFilters: StatusFilter[] = [
	{ value: null, label: "Todos os projetos", countKey: "total" },
	...projectStatusSchema.options.map((status) => ({
		value: status,
		label: projectStatusLabels[status],
		countKey: projectStatusCountKeys[status],
	})),
];

const formatCount = (count: number) => String(count).padStart(2, "0");

export const ProjectStatusFilters = ({
	counts,
	value,
	onValueChange,
	className,
}: ProjectStatusFiltersProps) => (
	<div
		role="group"
		className={cn(
			"overflow-x-auto bg-primary text-primary-foreground",
			className,
		)}
		aria-label="Filtrar projetos por situação"
	>
		<div className="grid min-w-4xl grid-cols-6">
			{statusFilters.map((filter) => {
				const isActive = value === filter.value;

				return (
					<button
						key={filter.value ?? "ALL"}
						type="button"
						aria-pressed={isActive}
						onClick={() => onValueChange(filter.value)}
						className="group relative flex min-h-30 flex-col justify-center gap-2 border-r border-primary-foreground/20 pr-5 pl-gutter text-left last:border-r-0 focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:outline-none md:pl-gutter-md"
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
