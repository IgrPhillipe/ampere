import { type DateRange, DateRangeFilter } from "@components/DateRangeFilter";
import { FilterMenu } from "@components/FilterMenu";
import { type BrazilianState, useGetStateList } from "@services/locations";
import {
	type ProjectFindingsFilter,
	projectFindingsFilterSchema,
	useGetMunicipalityList,
	useGetProjectStateList,
} from "@services/projects";

import { projectFindingsFilterLabels } from "../../constants/project-findings";

const findingsOptions = projectFindingsFilterSchema.options.map((value) => ({
	value,
	label: projectFindingsFilterLabels[value],
}));

interface ProjectFilterControlsProps {
	state: BrazilianState | null;
	onStateChange: (state: BrazilianState | null) => void;
	municipality: string | null;
	onMunicipalityChange: (municipality: string | null) => void;
	period: DateRange;
	onPeriodChange: (period: DateRange) => void;
	findings: ProjectFindingsFilter | null;
	onFindingsChange: (findings: ProjectFindingsFilter | null) => void;
}

export const ProjectFilterControls = ({
	state,
	onStateChange,
	municipality,
	onMunicipalityChange,
	period,
	onPeriodChange,
	findings,
	onFindingsChange,
}: ProjectFilterControlsProps) => {
	const statesQuery = useGetProjectStateList();
	const stateNamesQuery = useGetStateList();
	const municipalitiesQuery = useGetMunicipalityList(state ?? undefined);
	const states = (statesQuery.data?.data ?? []).map((value) => ({
		value,
		label:
			stateNamesQuery.data?.find(({ sigla }) => sigla === value)?.nome ?? value,
	}));
	const municipalities = (municipalitiesQuery.data?.data ?? []).map((name) => ({
		value: name,
		label: name,
	}));

	return (
		<>
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
			<DateRangeFilter
				label="Criado em"
				allLabel="Qualquer data"
				value={period}
				onValueChange={onPeriodChange}
			/>
			<FilterMenu
				label="Apontamentos"
				allLabel="Todos"
				options={findingsOptions}
				value={findings}
				onValueChange={onFindingsChange}
			/>
		</>
	);
};
