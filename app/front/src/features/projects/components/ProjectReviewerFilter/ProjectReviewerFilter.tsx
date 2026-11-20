import { FilterMenu } from "@components/FilterMenu";
import {
	UNASSIGNED_REVIEWER,
	useGetReviewerList,
} from "@services/review-queue";

/** A project under review that no analyst holds yet. */
export const UNASSIGNED_REVIEWER_LABEL = "Sem analista";

interface ProjectReviewerFilterProps {
	value: string | null;
	onValueChange: (reviewer: string | null) => void;
}

/** The manager's filter by analyst, with the projects nobody holds yet. */
export const ProjectReviewerFilter = ({
	value,
	onValueChange,
}: ProjectReviewerFilterProps) => {
	const reviewersQuery = useGetReviewerList();
	const options = [
		{ value: UNASSIGNED_REVIEWER, label: UNASSIGNED_REVIEWER_LABEL },
		...(reviewersQuery.data?.data ?? []).map(({ id, name, active }) => ({
			value: id,
			label: active ? name : `${name} (Inativo)`,
		})),
	];

	return (
		<FilterMenu
			label="Analista"
			allLabel="Todos"
			options={options}
			value={value}
			onValueChange={onValueChange}
			disabled={reviewersQuery.isPending}
		/>
	);
};
