import { type ActiveFilter, ActiveFilters } from "@components/ActiveFilters";
import {
	type ReviewQueueFilter,
	UNASSIGNED_REVIEWER,
	useGetReviewerList,
} from "@services/review-queue";

import type { ReviewQueueFilters } from "../../hooks";

const filterLabels: Record<Exclude<ReviewQueueFilter, "ALL">, string> = {
	DUE_SOON: "Vencendo o prazo",
	HIGH_DEMAND: "Acima de 50 kVA",
	REANALYSIS: "Reanálise",
};

interface ReviewQueueActiveFiltersProps {
	filters: ReviewQueueFilters;
}

export const ReviewQueueActiveFilters = ({
	filters,
}: ReviewQueueActiveFiltersProps) => {
	const reviewersQuery = useGetReviewerList();
	const { filter, search, reviewer, municipality } = filters;
	const active: ActiveFilter[] = [];

	if (filter !== "ALL") {
		active.push({
			id: "filter",
			label: filterLabels[filter],
			onRemove: () => filters.setFilter("ALL"),
		});
	}

	if (search.trim()) {
		active.push({
			id: "search",
			label: `Busca: ${search.trim()}`,
			onRemove: () => filters.setSearch(""),
		});
	}

	if (reviewer === UNASSIGNED_REVIEWER) {
		active.push({
			id: "reviewer",
			label: "Sem analista",
			onRemove: () => filters.setReviewer(null),
		});
	} else if (reviewer && !reviewersQuery.isPending) {
		const name =
			reviewersQuery.data?.data.find(({ id }) => id === reviewer)?.name ??
			reviewer;

		active.push({
			id: "reviewer",
			label: `Analista: ${name}`,
			onRemove: () => filters.setReviewer(null),
		});
	}

	if (filters.state) {
		active.push({
			id: "state",
			label: `UF: ${filters.state}`,
			onRemove: () => filters.setState(null),
		});
	}

	if (municipality) {
		active.push({
			id: "municipality",
			label: `Município: ${municipality}`,
			onRemove: () => filters.setMunicipality(null),
		});
	}

	return <ActiveFilters filters={active} onClear={filters.clearFilters} />;
};
