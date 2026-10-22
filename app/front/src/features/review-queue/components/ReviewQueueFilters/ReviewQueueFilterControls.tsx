import { FilterSelect } from "@components/FilterSelect";
import { useGetMunicipalityList } from "@services/projects";
import {
	UNASSIGNED_REVIEWER,
	useGetReviewerList,
} from "@services/review-queue";

import type { ReviewQueueFilters } from "../../hooks";

interface ReviewQueueFilterControlsProps {
	filters: ReviewQueueFilters;
}

export const ReviewQueueFilterControls = ({
	filters,
}: ReviewQueueFilterControlsProps) => {
	const reviewersQuery = useGetReviewerList();
	const municipalitiesQuery = useGetMunicipalityList();

	const reviewers = [
		{ value: UNASSIGNED_REVIEWER, label: "Sem Analista" },
		...(reviewersQuery.data?.data ?? []).map(({ id, name }) => ({
			value: id,
			label: name,
		})),
	];
	const municipalities = (municipalitiesQuery.data?.data ?? []).map((name) => ({
		value: name,
		label: name,
	}));

	return (
		<>
			<FilterSelect
				label="Analista"
				allLabel="Todos os Analistas"
				options={reviewers}
				value={filters.reviewer}
				onValueChange={filters.setReviewer}
				disabled={reviewersQuery.isPending}
			/>
			<FilterSelect
				label="Município"
				allLabel="Todos os Municípios"
				options={municipalities}
				value={filters.municipality}
				onValueChange={filters.setMunicipality}
				disabled={municipalitiesQuery.isPending}
			/>
		</>
	);
};
