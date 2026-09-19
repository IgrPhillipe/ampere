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
		<div className="-mx-4 md:-mx-7">
			<ProjectStatusFilters
				counts={counts}
				value={status}
				onValueChange={onStatusChange}
			/>
		</div>
		<div className="border-b border-border px-6 py-4">
			<ProjectSearch value={search} onValueChange={onSearchChange} />
		</div>
	</div>
);
