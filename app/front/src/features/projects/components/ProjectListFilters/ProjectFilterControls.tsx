import { type DateRange, DateRangeFilter } from "@components/DateRangeFilter";
import { FilterMenu } from "@components/FilterMenu";
import {
	type ProjectFindingsFilter,
	projectFindingsFilterSchema,
	useGetMunicipalityList,
	useGetProjectOwnerList,
} from "@services/projects";

import { projectFindingsFilterLabels } from "../../constants/project-findings";

const findingsOptions = projectFindingsFilterSchema.options.map((value) => ({
	value,
	label: projectFindingsFilterLabels[value],
}));

interface ProjectFilterControlsProps {
	/** Only the admin lists other designers' projects, so only they filter by one. */
	showOwner?: boolean;
	owner?: string | null;
	onOwnerChange?: (owner: string | null) => void;
	municipality: string | null;
	onMunicipalityChange: (municipality: string | null) => void;
	period: DateRange;
	onPeriodChange: (period: DateRange) => void;
	findings: ProjectFindingsFilter | null;
	onFindingsChange: (findings: ProjectFindingsFilter | null) => void;
}

export const ProjectFilterControls = ({
	showOwner = false,
	owner = null,
	onOwnerChange,
	municipality,
	onMunicipalityChange,
	period,
	onPeriodChange,
	findings,
	onFindingsChange,
}: ProjectFilterControlsProps) => {
	const ownersQuery = useGetProjectOwnerList({ enabled: showOwner });
	const owners = (ownersQuery.data?.data ?? []).map(({ id, name }) => ({
		value: id,
		label: name,
	}));
	const municipalitiesQuery = useGetMunicipalityList();
	const municipalities = (municipalitiesQuery.data?.data ?? []).map((name) => ({
		value: name,
		label: name,
	}));

	return (
		<>
			{showOwner && onOwnerChange ? (
				<FilterMenu
					label="Projetista"
					allLabel="Todos"
					options={owners}
					value={owner}
					onValueChange={onOwnerChange}
					disabled={ownersQuery.isPending}
				/>
			) : null}
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
