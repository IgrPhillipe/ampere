import { type DateRange, DateRangeFilter } from "@components/DateRangeFilter";
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
} from "@services/projects";

import { projectFindingsFilterLabels } from "../../constants/project-findings";
import { ProjectOwnerFilter } from "../ProjectOwnerFilter";
import { ProjectReviewerFilter } from "../ProjectReviewerFilter";

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
	/** The manager's filter by analyst, beside the designer's. */
	reviewer?: string | null;
	onReviewerChange?: (reviewer: string | null) => void;
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
	reviewer = null,
	onReviewerChange,
	state,
	onStateChange,
	municipality,
	onMunicipalityChange,
	period,
	onPeriodChange,
	findings,
	onFindingsChange,
}: ProjectFilterControlsProps) => (
	<>
		{showOwner && onOwnerChange ? (
			<ProjectOwnerFilter
				value={owner}
				selectedLabel={ownerName}
				onValueChange={onOwnerChange}
			/>
		) : null}
		{showOwner && onReviewerChange ? (
			<ProjectReviewerFilter
				value={reviewer}
				onValueChange={onReviewerChange}
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
