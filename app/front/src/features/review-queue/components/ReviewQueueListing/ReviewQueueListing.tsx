import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import type { ListSort } from "@features/shared";
import type { ReviewQueueItem, ReviewQueueSort } from "@services/review-queue";
import { useMemo } from "react";

import {
	createReviewQueueColumns,
	type ReviewQueueColumnId,
	type ReviewQueueRowActions,
} from "./review-queue-columns";
import {
	type ReviewQueueSelection,
	ReviewQueueSelectionContext,
} from "./selection-context";

/** `table-fixed`: these widths fit the sheet at 1440 px, and the name takes the rest. */
const columnClassNames = {
	select: "w-12 pr-0",
	attention: "w-5 px-0",
	protocol: "w-28",
	units: "w-16 text-right",
	demand: "w-28 text-right",
	warnings: "w-32",
	deadline: "w-28 text-right",
	status: "w-32 text-right",
	reviewer: "w-36",
	action: "w-24 pr-0 text-right",
} satisfies Partial<Record<ReviewQueueColumnId, string>>;

// Receipt still sorts from the sort menu.
const sortableColumns = [
	"deadline",
	"demand",
	"warnings",
] as const satisfies readonly ReviewQueueSort[];

interface ReviewQueueListingProps extends ReviewQueueRowActions {
	items: ReviewQueueItem[];
	/** Decides between "Analisar" and "Consultar" on each row. */
	currentUserId?: string;
	/** Present for the manager, who assigns projects in batch. */
	selection?: ReviewQueueSelection;
	isLoading?: boolean;
	sort?: ListSort<ReviewQueueSort>;
	onSortChange?: (column: ReviewQueueSort) => void;
	onClearFilters?: () => void;
}

export const ReviewQueueListing = ({
	items,
	isLoading = false,
	onAnalyze,
	currentUserId,
	selection,
	sort,
	onSortChange,
	onClearFilters,
}: ReviewQueueListingProps) => {
	const selectable = selection !== undefined;
	// Only what changes the column set: a new definition remounts every cell.
	const columns = useMemo(
		() => createReviewQueueColumns({ onAnalyze, currentUserId, selectable }),
		[onAnalyze, currentUserId, selectable],
	);

	if (isLoading) return <SkeletonTable columns={selection ? 10 : 9} />;

	if (items.length === 0) {
		return onClearFilters ? (
			<EmptyState
				title="Nenhum projeto encontrado para os critérios informados"
				description="Revise a busca e os filtros, ou limpe os filtros para ver toda a fila."
				action={
					<Button type="button" variant="outline" onClick={onClearFilters}>
						Limpar Filtros
					</Button>
				}
			/>
		) : (
			<EmptyState
				title="Nenhum projeto aguardando análise"
				description="Os projetos enviados pelos projetistas aparecem aqui."
			/>
		);
	}

	const table = (
		<DataTable<ReviewQueueItem, ReviewQueueColumnId, ReviewQueueSort>
			columns={columns}
			data={items}
			columnClassNames={columnClassNames}
			tableClassName="min-w-[72rem]"
			sortableColumns={sortableColumns}
			sort={sort}
			onSortChange={onSortChange}
		/>
	);

	return selection ? (
		<ReviewQueueSelectionContext
			value={{ ...selection, pageIds: items.map(({ id }) => id) }}
		>
			{table}
		</ReviewQueueSelectionContext>
	) : (
		table
	);
};
