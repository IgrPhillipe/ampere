import { type ActiveFilter, ActiveFilters } from "@components/ActiveFilters";
import type { DateRange } from "@components/DateRangeFilter";
import { formatDate } from "@features/shared";
import { useGetProjectOwnerList } from "@services/projects";

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
	const { status, search, municipality, period, findings, owner } = filters;
	const ownersQuery = useGetProjectOwnerList({ enabled: owner !== null });
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

	// Waits for the names, so the tag never flashes the raw id.
	if (owner && !ownersQuery.isPending) {
		const name =
			ownersQuery.data?.data.find(({ id }) => id === owner)?.name ?? owner;

		active.push({
			id: "owner",
			label: `Projetista: ${name}`,
			onRemove: () => filters.setOwner(null),
		});
	}

	for (const state of filters.state) {
		active.push({
			id: `state-${state}`,
			label: `UF: ${state}`,
			onRemove: () =>
				filters.setState(filters.state.filter((value) => value !== state)),
		});
	}

	for (const name of municipality) {
		active.push({
			id: `municipality-${name}`,
			label: `Município: ${name}`,
			onRemove: () =>
				filters.setMunicipality(municipality.filter((value) => value !== name)),
		});
	}

	if (period.from || period.to) {
		active.push({
			id: "period",
			label: periodLabel(period),
			onRemove: () => filters.setPeriod({ from: null, to: null }),
		});
	}

	for (const situation of findings) {
		active.push({
			id: `findings-${situation}`,
			label: `Apontamentos: ${projectFindingsFilterLabels[situation]}`,
			onRemove: () =>
				filters.setFindings(findings.filter((value) => value !== situation)),
		});
	}

	return <ActiveFilters filters={active} onClear={filters.clearFilters} />;
};
