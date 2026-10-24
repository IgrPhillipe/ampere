import { FilterMenu } from "@components/FilterMenu";
import { MultiFilterMenu } from "@components/MultiFilterMenu";
import { SearchableFilterMenu } from "@components/SearchableFilterMenu";
import {
	CONCESSION_STATES,
	type ConcessionState,
	concessionMunicipalityNames,
	concessionStateNames,
} from "@services/locations";
import {
	UNASSIGNED_REVIEWER,
	useGetReviewerList,
} from "@services/review-queue";

const stateOptions = CONCESSION_STATES.map((value) => ({
	value,
	label: concessionStateNames[value],
}));

interface ReviewQueueFilterControlsProps {
	reviewer: string | null;
	onReviewerChange: (reviewer: string | null) => void;
	state: ConcessionState[];
	onStateChange: (state: ConcessionState[]) => void;
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

	const reviewers = [
		{ value: UNASSIGNED_REVIEWER, label: "Sem analista" },
		...(reviewersQuery.data?.data ?? []).map(({ id, name }) => ({
			value: id,
			label: name,
		})),
	];

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
				options={stateOptions}
				value={state}
				onValueChange={onStateChange}
			/>
			<SearchableFilterMenu
				label="Município"
				allLabel="Todos"
				searchPlaceholder="Buscar município"
				emptyMessage="Nenhum município encontrado."
				options={concessionMunicipalityNames(state)}
				value={municipality}
				onValueChange={onMunicipalityChange}
			/>
		</>
	);
};
