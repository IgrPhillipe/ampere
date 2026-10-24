import { type DateRange, DateRangeFilter } from "@components/DateRangeFilter";
import { FilterSelect } from "@components/FilterSelect";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { useGetMunicipalityList } from "@services/projects";

interface ProjectFilterControlsProps {
	municipality: string | null;
	onMunicipalityChange: (municipality: string | null) => void;
	period: DateRange;
	onPeriodChange: (period: DateRange) => void;
	hasBlocking: boolean;
	onHasBlockingChange: (hasBlocking: boolean) => void;
}

export const ProjectFilterControls = ({
	municipality,
	onMunicipalityChange,
	period,
	onPeriodChange,
	hasBlocking,
	onHasBlockingChange,
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
				allLabel="Todos os municípios"
				options={municipalities}
				value={municipality}
				onValueChange={onMunicipalityChange}
				disabled={municipalitiesQuery.isPending}
			/>
			<DateRangeFilter
				label="Criado entre"
				value={period}
				onValueChange={onPeriodChange}
			/>
			<Label className="h-11 cursor-pointer font-normal">
				<Switch checked={hasBlocking} onCheckedChange={onHasBlockingChange} />
				Com apontamento bloqueante
			</Label>
		</>
	);
};
