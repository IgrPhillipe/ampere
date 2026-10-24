import { FilterMenu } from "@components/FilterMenu";
import { InfiniteFilterMenu } from "@components/InfiniteFilterMenu";
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
	useGetQueueOwnerInfiniteList,
	useGetReviewerList,
} from "@services/review-queue";
import { useState } from "react";

const stateOptions = CONCESSION_STATES.map((value) => ({
	value,
	label: concessionStateNames[value],
}));

interface ReviewQueueFilterControlsProps {
	reviewer: string | null;
	onReviewerChange: (reviewer: string | null) => void;
	owner: string | null;
	/** The selected designer's name, which may not be among the loaded owners. */
	ownerName?: string;
	onOwnerChange: (owner: string | null) => void;
	state: ConcessionState[];
	onStateChange: (state: ConcessionState[]) => void;
	municipality: string[];
	onMunicipalityChange: (municipality: string[]) => void;
}

export const ReviewQueueFilterControls = ({
	reviewer,
	onReviewerChange,
	owner,
	ownerName,
	onOwnerChange,
	state,
	onStateChange,
	municipality,
	onMunicipalityChange,
}: ReviewQueueFilterControlsProps) => {
	const reviewersQuery = useGetReviewerList();
	const [ownerSearch, setOwnerSearch] = useState("");
	const ownersQuery = useGetQueueOwnerInfiniteList({ search: ownerSearch });
	const owners = (ownersQuery.data?.pages ?? [])
		.flatMap(({ data }) => data)
		.map(({ id, name }) => ({ value: id, label: name }));

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
			<InfiniteFilterMenu
				label="Projetista"
				allLabel="Todos"
				searchPlaceholder="Buscar projetista"
				emptyMessage="Nenhum projetista encontrado."
				options={owners}
				value={owner}
				selectedLabel={ownerName}
				onValueChange={onOwnerChange}
				onSearchChange={setOwnerSearch}
				hasNextPage={ownersQuery.hasNextPage}
				isFetchingNextPage={ownersQuery.isFetchingNextPage}
				isLoading={ownersQuery.isPending}
				onLoadMore={() => void ownersQuery.fetchNextPage()}
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
