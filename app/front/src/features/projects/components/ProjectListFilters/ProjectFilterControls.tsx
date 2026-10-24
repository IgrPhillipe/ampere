import { type DateRange, DateRangeFilter } from "@components/DateRangeFilter";
import { FilterMenu } from "@components/FilterMenu";
import {
	type ProjectFindingsFilter,
	projectFindingsFilterSchema,
	useGetMunicipalityList,
} from "@services/projects";

import { projectFindingsFilterLabels } from "../../constants/project-findings";

const findingsOptions = projectFindingsFilterSchema.options.map((value) => ({
	value,
	label: projectFindingsFilterLabels[value],
}));

interface ProjectFilterControlsProps {
	municipality: string | null;
	onMunicipalityChange: (municipality: string | null) => void;
	period: DateRange;
	onPeriodChange: (period: DateRange) => void;
	findings: ProjectFindingsFilter | null;
	onFindingsChange: (findings: ProjectFindingsFilter | null) => void;
}

export const ProjectFilterControls = ({
	municipality,
	onMunicipalityChange,
	period,
	onPeriodChange,
	findings,
	onFindingsChange,
}: ProjectFilterControlsProps) => {
	const municipalitiesQuery = useGetMunicipalityList();
	const municipalities = (municipalitiesQuery.data?.data ?? []).map((name) => ({
		value: name,
		label: name,
	}));

	return (
		<>
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
