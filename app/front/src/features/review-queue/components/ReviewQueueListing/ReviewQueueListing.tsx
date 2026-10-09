import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import type { ReviewQueueItem } from "@services/review-queue";

import { ReviewQueueCards } from "./ReviewQueueCards";
import {
	type ReviewQueueColumnId,
	reviewQueueColumns,
} from "./review-queue-columns";

const columnClassNames = {
	attention: "w-10 pr-0",
	protocol: "w-32 xl:w-36",
	units: "w-16",
	demand: "w-28",
	warnings: "w-36",
	deadline: "w-36",
	action: "w-28",
} satisfies Partial<Record<ReviewQueueColumnId, string>>;

interface ReviewQueueListingProps {
	items: ReviewQueueItem[];
	isLoading?: boolean;
	onClearFilters?: () => void;
}

export const ReviewQueueListing = ({
	items,
	isLoading = false,
	onClearFilters,
}: ReviewQueueListingProps) => {
	if (isLoading) return <SkeletonTable columns={8} />;

	if (items.length === 0) {
		return onClearFilters ? (
			<EmptyState
				title="Nenhum projeto encontrado para os critérios informados"
				description="Verifique a busca ou limpe os filtros para ver toda a fila."
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
			<ReviewQueueCards items={items} className="lg:hidden" />
			<DataTable
				columns={reviewQueueColumns}
				data={items}
				columnClassNames={columnClassNames}
				className="hidden lg:block"
			/>
		</>
	);
};
