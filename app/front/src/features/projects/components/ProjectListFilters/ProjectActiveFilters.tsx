import { type ActiveFilter, ActiveFilters } from "@components/ActiveFilters";
import { formatDate } from "@features/shared";

import { projectStatusLabels } from "../../constants/project-status";
import type { ProjectFilters } from "../../hooks";

interface ProjectActiveFiltersProps {
	filters: ProjectFilters;
}

const periodLabel = (from: string | null, to: string | null) => {
	if (from && to) return `Criado de ${formatDate(from)} a ${formatDate(to)}`;
	if (from) return `Criado a partir de ${formatDate(from)}`;
	return `Criado até ${formatDate(to ?? "")}`;
};

export const ProjectActiveFilters = ({
	filters,
}: ProjectActiveFiltersProps) => {
	const { status, search, municipality, createdFrom, createdTo, hasBlocking } =
		filters;
	const active: ActiveFilter[] = [];

	if (status) {
		active.push({
			id: "status",
			label: `Situação: ${projectStatusLabels[status]}`,
			onRemove: () => filters.setStatus(null),
		});
	}

	if (search.trim()) {
		active.push({
			id: "search",
			label: `Busca: ${search.trim()}`,
			onRemove: () => filters.setSearch(""),
		});
	}

	if (municipality) {
		active.push({
			id: "municipality",
			label: `Município: ${municipality}`,
			onRemove: () => filters.setMunicipality(null),
		});
	}

	if (createdFrom || createdTo) {
		active.push({
			id: "period",
			label: periodLabel(createdFrom, createdTo),
			onRemove: filters.clearPeriod,
		});
	}

	if (hasBlocking) {
		active.push({
			id: "hasBlocking",
			label: "Com Apontamento Bloqueante",
			onRemove: () => filters.setHasBlocking(false),
		});
	}

	return <ActiveFilters filters={active} onClear={filters.clearFilters} />;
};
