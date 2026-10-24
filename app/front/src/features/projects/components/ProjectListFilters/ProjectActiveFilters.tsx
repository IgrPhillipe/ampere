import { type ActiveFilter, ActiveFilters } from "@components/ActiveFilters";
import type { DateRange } from "@components/DateRangeFilter";
import { formatDate } from "@features/shared";

import { projectFindingsFilterLabels } from "../../constants/project-findings";
import { projectStatusLabels } from "../../constants/project-status";
import type { ProjectFilters } from "../../hooks";

interface ProjectActiveFiltersProps {
	filters: ProjectFilters;
}

const periodLabel = ({ from, to }: DateRange) => {
	if (from && to) return `Criado de ${formatDate(from)} a ${formatDate(to)}`;
	if (from) return `Criado a partir de ${formatDate(from)}`;
	return `Criado até ${formatDate(to ?? "")}`;
};

export const ProjectActiveFilters = ({
	filters,
}: ProjectActiveFiltersProps) => {
	const { status, search, municipality, period, findings } = filters;
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

	if (period.from || period.to) {
		active.push({
			id: "period",
			label: periodLabel(period),
			onRemove: () => filters.setPeriod({ from: null, to: null }),
		});
	}

	if (findings) {
		active.push({
			id: "findings",
			label: `Apontamentos: ${projectFindingsFilterLabels[findings].toLowerCase()}`,
			onRemove: () => filters.setFindings(null),
		});
	}

	return <ActiveFilters filters={active} onClear={filters.clearFilters} />;
};
