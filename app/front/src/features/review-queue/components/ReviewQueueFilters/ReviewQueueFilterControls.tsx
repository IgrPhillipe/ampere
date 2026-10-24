import { FilterMenu } from "@components/FilterMenu";
import { type BrazilianState, useGetStateList } from "@services/locations";
import {
	useGetMunicipalityList,
	useGetProjectStateList,
} from "@services/projects";
import {
	UNASSIGNED_REVIEWER,
	useGetReviewerList,
} from "@services/review-queue";

interface ReviewQueueFilterControlsProps {
	reviewer: string | null;
	onReviewerChange: (reviewer: string | null) => void;
	state: BrazilianState | null;
	onStateChange: (state: BrazilianState | null) => void;
	municipality: string | null;
	onMunicipalityChange: (municipality: string | null) => void;
}

export const ReviewQueueFilterControls = ({
	reviewer,
	onReviewerChange,
	state,
	onStateChange,
	municipality,
	onMunicipalityChange,
}: ReviewQueueFilterControlsProps) => {
	const reviewersQuery = useGetReviewerList();
	const statesQuery = useGetProjectStateList();
	const stateNamesQuery = useGetStateList();
	const municipalitiesQuery = useGetMunicipalityList(state ?? undefined);
	const states = (statesQuery.data?.data ?? []).map((value) => ({
		value,
		label:
			stateNamesQuery.data?.find(({ sigla }) => sigla === value)?.nome ?? value,
	}));

	const reviewers = [
		{ value: UNASSIGNED_REVIEWER, label: "Sem analista" },
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
			<FilterMenu
				label="Analista"
				allLabel="Todos"
				options={reviewers}
				value={reviewer}
				onValueChange={onReviewerChange}
				disabled={reviewersQuery.isPending}
			/>
			<FilterMenu
				label="UF"
				allLabel="Todas"
				options={states}
				value={state}
				onValueChange={onStateChange}
				disabled={statesQuery.isPending}
			/>
			<FilterMenu
				label="Município"
				allLabel="Todos"
				options={municipalities}
				value={municipality}
				onValueChange={onMunicipalityChange}
				disabled={municipalitiesQuery.isPending}
			/>
		</>
	);
};
