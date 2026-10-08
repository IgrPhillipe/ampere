import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { Pagination } from "@components/Pagination";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import type { Pagination as PaginationData } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";
import { CircleAlert } from "lucide-react";

import { ReviewQueueCards } from "./ReviewQueueCards";
import {
	type ReviewQueueColumnId,
	reviewQueueColumns,
} from "./review-queue-columns";

const columnClassNames = {
	protocol: "w-40 px-3 py-2.5",
	name: "w-auto min-w-0 px-3 py-2.5",
	units: "w-20 px-3 py-2.5",
	demand: "w-32 px-3 py-2.5",
	warnings: "w-36 px-3 py-2.5",
	deadline: "w-36 px-3 py-2.5 text-right",
	action: "w-24 px-3 py-2.5",
} satisfies Partial<Record<ReviewQueueColumnId, string>>;

interface ReviewQueueListingProps {
	items: ReviewQueueItem[];
	pagination?: PaginationData;
	isLoading?: boolean;
	isError?: boolean;
	onRetry: () => void;
	onPageChange: (page: number) => void;
	onClearFilters?: () => void;
}

export const ReviewQueueListing = ({
	items,
	pagination,
	isLoading = false,
	isError = false,
	onRetry,
	onPageChange,
	onClearFilters,
}: ReviewQueueListingProps) => {
	if (isLoading) return <SkeletonTable columns={7} />;

	if (isError) {
		return (
			<EmptyState
				title="Não foi possível carregar a fila de análise"
				description="Verifique sua conexão e tente novamente."
				icon={CircleAlert}
				action={
					<Button type="button" variant="outline" onClick={onRetry}>
						Tentar novamente
					</Button>
				}
			/>
		);
	}

	if (items.length === 0) {
		return (
			<EmptyState
				title="Nenhum projeto encontrado na fila"
				description={
					onClearFilters
						? "Revise a pesquisa ou limpe os filtros para ver todos os projetos."
						: "Não há projetos aguardando análise neste momento."
				}
				action={
					onClearFilters ? (
						<Button type="button" variant="outline" onClick={onClearFilters}>
							Limpar filtros
						</Button>
					) : undefined
				}
			/>
		);
	}

	return (
		<>
			<ReviewQueueCards items={items} className="lg:hidden" />
			<DataTable
				columns={reviewQueueColumns}
				data={items}
				columnClassNames={columnClassNames}
				className="hidden overflow-x-hidden lg:block [&_[data-slot=table-container]]:overflow-x-hidden"
			/>
			{pagination ? (
				<Pagination
					page={pagination.page}
					pageSize={pagination.pageSize}
					total={pagination.total}
					onPageChange={onPageChange}
					itemLabel="projetos"
				/>
			) : null}
		</>
	);
};
