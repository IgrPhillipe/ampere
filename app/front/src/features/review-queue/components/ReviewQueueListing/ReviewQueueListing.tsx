import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import type { ListSort } from "@features/shared";
import type { ReviewQueueItem, ReviewQueueSort } from "@services/review-queue";
import { useMemo } from "react";

import { ReviewQueueCards } from "./ReviewQueueCards";
import {
	createReviewQueueColumns,
	type ReviewQueueColumnId,
	type ReviewQueueRowActions,
} from "./review-queue-columns";

const columnClassNames = {
	attention: "w-10 pr-0",
	protocol: "w-28 text-center",
	status: "w-32 text-center",
	deadline: "w-36 text-center",
	submittedAt: "hidden 2xl:table-cell 2xl:w-32 text-center",
	cycle: "hidden xl:table-cell xl:w-28 text-center",
	units: "hidden xl:table-cell xl:w-16 text-center",
	demand: "w-28 text-center",
	warnings: "w-24 text-center",
	action: "w-32",
} satisfies Partial<Record<ReviewQueueColumnId, string>>;

const sortableColumns = [
	"deadline",
	"submittedAt",
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

	if (isLoading) return <SkeletonTable columns={10} />;

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
		<>
			<ReviewQueueCards
				items={items}
				onAnalyze={onAnalyze}
				className="lg:hidden"
			/>
			<DataTable<ReviewQueueItem, ReviewQueueColumnId, ReviewQueueSort>
				columns={columns}
				data={items}
				columnClassNames={columnClassNames}
				sortableColumns={sortableColumns}
				sort={sort}
				onSortChange={onSortChange}
				className="hidden lg:block"
			/>
		</>
	);
};
