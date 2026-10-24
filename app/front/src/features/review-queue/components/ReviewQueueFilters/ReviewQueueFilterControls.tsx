import { FilterMenu } from "@components/FilterMenu";
import { MultiFilterMenu } from "@components/MultiFilterMenu";
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
	state: BrazilianState[];
	onStateChange: (state: BrazilianState[]) => void;
	municipality: string[];
	onMunicipalityChange: (municipality: string[]) => void;
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
	const municipalitiesQuery = useGetMunicipalityList(state);
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
			<MultiFilterMenu
				label="UF"
				allLabel="Todas"
				options={states}
				value={state}
				onValueChange={onStateChange}
				disabled={statesQuery.isPending}
			/>
			<MultiFilterMenu
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
