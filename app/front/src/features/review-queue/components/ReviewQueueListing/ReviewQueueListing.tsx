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

/** `table-fixed`: these widths fit the sheet at 1440 px, and the name takes the rest. */
const columnClassNames = {
	attention: "w-5 px-0",
	protocol: "w-28",
	units: "w-16 text-right",
	demand: "w-28 text-right",
	warnings: "w-32",
	deadline: "w-28 text-right",
	status: "w-32 text-right",
	action: "w-28 pr-0 text-right",
} satisfies Partial<Record<ReviewQueueColumnId, string>>;

// Receipt still sorts from the sort menu.
const sortableColumns = [
	"deadline",
	"demand",
	"warnings",
] as const satisfies readonly ReviewQueueSort[];

interface ReviewQueueListingProps extends ReviewQueueRowActions {
	items: ReviewQueueItem[];
	isLoading?: boolean;
	sort?: ListSort<ReviewQueueSort>;
	onSortChange?: (column: ReviewQueueSort) => void;
	onClearFilters?: () => void;
}

export const ReviewQueueListing = ({
	items,
	isLoading = false,
	onAnalyze,
	sort,
	onSortChange,
	onClearFilters,
}: ReviewQueueListingProps) => {
	const columns = useMemo(
		() => createReviewQueueColumns({ onAnalyze }),
		[onAnalyze],
	);

	if (isLoading) return <SkeletonTable columns={8} />;

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

	return (
		<DataTable<ReviewQueueItem, ReviewQueueColumnId, ReviewQueueSort>
			columns={columns}
			data={items}
			columnClassNames={columnClassNames}
			sortableColumns={sortableColumns}
			sort={sort}
			onSortChange={onSortChange}
		/>
	);
};
