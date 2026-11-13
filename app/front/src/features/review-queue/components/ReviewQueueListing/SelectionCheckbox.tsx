import { Checkbox } from "@components/ui/checkbox";
import type { ReviewQueueItem } from "@services/review-queue";

import { useReviewQueueSelection } from "./selection-context";

/** Selects or clears the whole page; indeterminate while only part of it is selected. */
export const SelectPageCheckbox = () => {
	const { selectedIds, pageIds, onSelectedIdsChange } =
		useReviewQueueSelection();
	const selectedOnPage = pageIds.filter((id) => selectedIds.includes(id));
	const all = pageIds.length > 0 && selectedOnPage.length === pageIds.length;

	return (
		<Checkbox
			aria-label="Selecionar todos os projetos da página"
			checked={all}
			indeterminate={selectedOnPage.length > 0 && !all}
			onCheckedChange={(checked) =>
				onSelectedIdsChange(
					checked
						? [...new Set([...selectedIds, ...pageIds])]
						: selectedIds.filter((id) => !pageIds.includes(id)),
				)
			}
		/>
	);
};

interface SelectRowCheckboxProps {
	item: ReviewQueueItem;
}

export const SelectRowCheckbox = ({ item }: SelectRowCheckboxProps) => {
	const { selectedIds, onSelectedIdsChange } = useReviewQueueSelection();

	return (
		<Checkbox
			aria-label={`Selecionar o projeto ${item.protocol}`}
			checked={selectedIds.includes(item.id)}
			onCheckedChange={(checked) =>
				onSelectedIdsChange(
					checked
						? [...selectedIds, item.id]
						: selectedIds.filter((selected) => selected !== item.id),
				)
			}
		/>
	);
};
