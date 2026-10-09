import { FilterTiles } from "@components/FilterTiles";
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

export const ProjectStatusFilters = ({
	counts,
	value,
	onValueChange,
	className,
}: ProjectStatusFiltersProps) => (
	<FilterTiles
		label="Filtrar projetos por situação"
		tiles={[
			{ value: null, label: "Todos os projetos", count: counts.total },
			// Order comes from the enum: the schema is the source, not a literal copy.
			...projectStatusSchema.options.map((status) => ({
				value: status,
				label: projectStatusLabels[status],
				count: counts[projectStatusCountKeys[status]],
			})),
		]}
		value={value}
		onValueChange={onValueChange}
		className={className}
	/>
);
