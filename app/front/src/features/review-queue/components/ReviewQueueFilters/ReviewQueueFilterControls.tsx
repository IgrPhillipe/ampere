import { FilterSelect } from "@components/FilterSelect";
import { useGetMunicipalityList } from "@services/projects";
import {
	UNASSIGNED_REVIEWER,
	useGetReviewerList,
} from "@services/review-queue";

interface ReviewQueueFilterControlsProps {
	reviewer: string | null;
	onReviewerChange: (reviewer: string | null) => void;
	municipality: string | null;
	onMunicipalityChange: (municipality: string | null) => void;
}

export const ReviewQueueFilterControls = ({
	reviewer,
	onReviewerChange,
	municipality,
	onMunicipalityChange,
}: ReviewQueueFilterControlsProps) => {
	const reviewersQuery = useGetReviewerList();
	const municipalitiesQuery = useGetMunicipalityList();

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
			<FilterSelect
				label="Analista"
				allLabel="Todos os analistas"
				options={reviewers}
				value={reviewer}
				onValueChange={onReviewerChange}
				disabled={reviewersQuery.isPending}
			/>
			<FilterSelect
				label="Município"
				allLabel="Todos os municípios"
				options={municipalities}
				value={municipality}
				onValueChange={onMunicipalityChange}
				disabled={municipalitiesQuery.isPending}
			/>
		</>
	);
};
