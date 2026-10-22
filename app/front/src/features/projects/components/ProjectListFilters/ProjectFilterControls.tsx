import { DateRangeFilter } from "@components/DateRangeFilter";
import { FilterSelect } from "@components/FilterSelect";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { useGetMunicipalityList } from "@services/projects";

import type { ProjectFilters } from "../../hooks";

interface ProjectFilterControlsProps {
	filters: ProjectFilters;
}

export const ProjectFilterControls = ({
	filters,
}: ProjectFilterControlsProps) => {
	const municipalitiesQuery = useGetMunicipalityList();
	const municipalities = (municipalitiesQuery.data?.data ?? []).map((name) => ({
		value: name,
		label: name,
	}));

	return (
		<>
			<FilterSelect
				label="Município"
				allLabel="Todos os Municípios"
				options={municipalities}
				value={filters.municipality}
				onValueChange={filters.setMunicipality}
				disabled={municipalitiesQuery.isPending}
			/>
			<DateRangeFilter
				label="Criado entre"
				from={filters.createdFrom}
				to={filters.createdTo}
				onFromChange={filters.setCreatedFrom}
				onToChange={filters.setCreatedTo}
			/>
			<Label className="h-11 cursor-pointer font-normal">
				<Switch
					checked={filters.hasBlocking}
					onCheckedChange={filters.setHasBlocking}
				/>
				Com Apontamento Bloqueante
			</Label>
		</>
	);
};
