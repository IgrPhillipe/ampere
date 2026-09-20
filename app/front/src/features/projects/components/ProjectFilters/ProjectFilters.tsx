import type { ProjectStatusCounts } from "@services/projects";

import type { ProjectStatusFilter } from "../../types";
import { ProjectSearch } from "../ProjectSearch";
import { ProjectStatusFilters } from "../ProjectStatusFilters";

interface ProjectFiltersProps {
	counts: ProjectStatusCounts;
	status: ProjectStatusFilter;
	search: string;
	onStatusChange: (value: ProjectStatusFilter) => void;
	onSearchChange: (value: string) => void;
}

export const ProjectFilters = ({
	counts,
	status,
	search,
	onStatusChange,
	onSearchChange,
}: ProjectFiltersProps) => (
	<div className="flex flex-col bg-card">
		<div>
			<ProjectStatusFilters
				counts={counts}
				value={status}
				onValueChange={onStatusChange}
			/>
		</div>
		<div className="border-b border-border px-gutter py-4 md:px-gutter-md">
			<ProjectSearch value={search} onValueChange={onSearchChange} />
		</div>
	</div>
);
