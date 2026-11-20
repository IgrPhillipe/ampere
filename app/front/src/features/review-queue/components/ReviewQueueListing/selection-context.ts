import { createContext, useContext } from "react";

/** Row selection of the batch assignment, offered to the manager only. */
export interface ReviewQueueSelection {
	selectedIds: readonly string[];
	onSelectedIdsChange: (ids: string[]) => void;
}

interface ReviewQueueSelectionContextValue extends ReviewQueueSelection {
	/** The ids on the page, which the header checkbox selects at once. */
	pageIds: readonly string[];
}

/**
 * Read by the checkbox cells, so the columns stay stable while the selection
 * changes: a new column definition remounts every cell and drops the focus.
 */
export const ReviewQueueSelectionContext =
	createContext<ReviewQueueSelectionContextValue>({
		selectedIds: [],
		pageIds: [],
		onSelectedIdsChange: () => undefined,
	});

export const useReviewQueueSelection = () =>
	useContext(ReviewQueueSelectionContext);
