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
	protocol: "w-28",
	status: "w-40",
	units: "hidden xl:table-cell xl:w-16",
	demand: "hidden xl:table-cell xl:w-28",
	warnings: "w-24",
	submittedAt: "hidden 2xl:table-cell 2xl:w-32",
	deadline: "w-28",
	action: "w-36",
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
	if (isLoading) return <SkeletonTable columns={10} />;

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
