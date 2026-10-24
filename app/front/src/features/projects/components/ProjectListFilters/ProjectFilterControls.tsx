import { type DateRange, DateRangeFilter } from "@components/DateRangeFilter";
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
	type ProjectFindingsFilter,
	projectFindingsFilterSchema,
	useGetProjectOwnerInfiniteList,
} from "@services/projects";
import { useState } from "react";

import { projectFindingsFilterLabels } from "../../constants/project-findings";

const stateOptions = CONCESSION_STATES.map((value) => ({
	value,
	label: concessionStateNames[value],
}));

const findingsOptions = projectFindingsFilterSchema.options.map((value) => ({
	value,
	label: projectFindingsFilterLabels[value],
}));

interface ProjectFilterControlsProps {
	showOwner?: boolean;
	owner?: string | null;
	/** The selected designer's name, which may not be among the loaded owners. */
	ownerName?: string;
	onOwnerChange?: (owner: string | null) => void;
	state: ConcessionState[];
	onStateChange: (state: ConcessionState[]) => void;
	municipality: string[];
	onMunicipalityChange: (municipality: string[]) => void;
	period: DateRange;
	onPeriodChange: (period: DateRange) => void;
	findings: ProjectFindingsFilter[];
	onFindingsChange: (findings: ProjectFindingsFilter[]) => void;
}

export const ProjectFilterControls = ({
	showOwner = false,
	owner = null,
	ownerName,
	onOwnerChange,
	state,
	onStateChange,
	municipality,
	onMunicipalityChange,
	period,
	onPeriodChange,
	findings,
	onFindingsChange,
}: ProjectFilterControlsProps) => {
	const [ownerSearch, setOwnerSearch] = useState("");
	const ownersQuery = useGetProjectOwnerInfiniteList({
		search: ownerSearch,
		enabled: showOwner,
	});
	const owners = (ownersQuery.data?.pages ?? [])
		.flatMap(({ data }) => data)
		.map(({ id, name }) => ({ value: id, label: name }));

	return (
		<>
			{showOwner && onOwnerChange ? (
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
			) : null}
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
			<DateRangeFilter
				label="Criado em"
				allLabel="Qualquer data"
				value={period}
				onValueChange={onPeriodChange}
			/>
			<MultiFilterMenu
				label="Apontamentos"
				allLabel="Todos"
				options={findingsOptions}
				value={findings}
				onValueChange={onFindingsChange}
			/>
		</>
	);
};
