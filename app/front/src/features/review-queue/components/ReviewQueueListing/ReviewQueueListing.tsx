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

/** `table-fixed`: these widths fit the sheet at 1280 px, and the name takes the rest. */
const columnClassNames = {
	attention: "w-5 px-0",
	protocol: "w-28",
	// From 1024 to 1280 px these give way, so the action stays in view.
	units: "w-16 text-right lg:hidden xl:table-cell",
	demand: "w-28 text-right lg:hidden xl:table-cell",
	warnings: "w-32",
	deadline: "w-28 text-right lg:hidden xl:table-cell",
	status: "w-36 text-right",
	decision: "w-40",
	reviewedAt: "w-32 text-right",
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
	/** Approved or rejected projects, with the decision in place of the deadline. */
	decided?: boolean;
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
	decided = false,
	sort,
	onSortChange,
	onClearFilters,
}: ReviewQueueListingProps) => {
	// Only what changes the column set: a new definition remounts every cell.
	const columns = useMemo(
		() =>
			createReviewQueueColumns({
				onAnalyze,
				currentUserId,
				decided,
			}),
		[onAnalyze, currentUserId, decided],
	);

	// The attention marker has no skeleton cell of its own.
	if (isLoading) return <SkeletonTable columns={columns.length - 1} />;

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
				description="Os projetos que o gestor atribuir a você aparecem aqui."
			/>
		);
	}

	return (
		<DataTable<ReviewQueueItem, ReviewQueueColumnId, ReviewQueueSort>
			columns={columns}
			data={items}
			columnClassNames={columnClassNames}
			// Below 1024 px every column stays and the table scrolls instead.
			tableClassName="min-w-[72rem] lg:min-w-0"
			// The decided projects come newest decision first, with nothing left to sort by.
			sortableColumns={decided ? [] : sortableColumns}
			sort={sort}
			onSortChange={onSortChange}
		/>
	);
};
