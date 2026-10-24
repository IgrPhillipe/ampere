import { type ActiveFilter, ActiveFilters } from "@components/ActiveFilters";

import { normativeStandardLabels } from "../../constants/normative-standard";
import { normativeTableStatusLabels } from "../../constants/normative-table-status";
import type { NormativeTableFilters } from "../../hooks";

interface NormativeTableActiveFiltersProps {
	filters: NormativeTableFilters;
}

export const NormativeTableActiveFilters = ({
	filters,
}: NormativeTableActiveFiltersProps) => {
	const { search, status, standard } = filters;
	const active: ActiveFilter[] = [];

	if (search.trim()) {
		active.push({
			id: "search",
			label: `Busca: ${search.trim()}`,
			onRemove: () => filters.setSearch(""),
		});
	}

	for (const value of status) {
		active.push({
			id: `status-${value}`,
			label: `Situação: ${normativeTableStatusLabels[value]}`,
			onRemove: () =>
				filters.setStatus(status.filter((selected) => selected !== value)),
		});
	}

	for (const value of standard) {
		active.push({
			id: `standard-${value}`,
			label: `Norma: ${normativeStandardLabels[value]}`,
			onRemove: () =>
				filters.setStandard(standard.filter((selected) => selected !== value)),
		});
	}

	return <ActiveFilters filters={active} onClear={filters.clearFilters} />;
};
