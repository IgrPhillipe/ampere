import {
	UNASSIGNED_REVIEWER,
	useGetReviewerList,
} from "@services/review-queue";

import { UNASSIGNED_REVIEWER_LABEL } from "./ProjectReviewerFilter";

/** The chip of the active filter: the analyst's name once the list arrives. */
export const useReviewerFilterLabel = (value: string | null) => {
	const reviewersQuery = useGetReviewerList({ enabled: value !== null });
	if (value === null) return undefined;
	if (value === UNASSIGNED_REVIEWER) return UNASSIGNED_REVIEWER_LABEL;

	return reviewersQuery.data?.data.find(({ id }) => id === value)?.name;
};
