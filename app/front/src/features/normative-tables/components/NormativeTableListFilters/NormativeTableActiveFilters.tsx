import { type ActiveFilter, ActiveFilters } from "@components/ActiveFilters";

import { normativeTableStatusLabels } from "../../constants/normative-table-status";
import type { NormativeTableFilters } from "../../hooks";

interface NormativeTableActiveFiltersProps {
	filters: NormativeTableFilters;
}

export const NormativeTableActiveFilters = ({
	filters,
}: NormativeTableActiveFiltersProps) => {
	const { search, status } = filters;
	const active: ActiveFilter[] = [];

	if (search.trim()) {
		active.push({
			id: "search",
			label: `Busca: ${search.trim()}`,
			onRemove: () => filters.setSearch(""),
		});
	}

	if (status) {
		active.push({
			id: "status",
			label: `Situação: ${normativeTableStatusLabels[status]}`,
			onRemove: () => filters.setStatus(null),
		});
	}

	return <ActiveFilters filters={active} onClear={filters.clearFilters} />;
};
