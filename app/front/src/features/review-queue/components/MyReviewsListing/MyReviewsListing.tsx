import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import { SkeletonTable } from "@components/SkeletonTable";
import { Button } from "@components/ui/button";
import type { MyReviewItem } from "@services/review-queue";

import { type MyReviewColumnId, myReviewColumns } from "./my-reviews-columns";

/** `table-fixed`: the name takes what the other columns leave; UCs and demand wait for `xl`. */
const columnClassNames = {
	protocol: "w-28",
	units: "w-16 text-right lg:hidden xl:table-cell",
	demand: "w-26 text-right lg:hidden xl:table-cell",
	version: "w-20 text-right",
	findings: "w-30 text-right",
	decision: "w-26",
	decidedAt: "w-28 text-right",
} satisfies Partial<Record<MyReviewColumnId, string>>;

interface MyReviewsListingProps {
	items: MyReviewItem[];
	isLoading?: boolean;
	/** Opens the project in consultation, or its history for an older decision. */
	onOpen: (item: MyReviewItem) => void;
	onClearFilters?: () => void;
}

export const MyReviewsListing = ({
	items,
	isLoading = false,
	onOpen,
	onClearFilters,
}: MyReviewsListingProps) => {
	if (isLoading) return <SkeletonTable columns={8} />;

	if (items.length === 0) {
		return onClearFilters ? (
			<EmptyState
				title="Nenhum parecer encontrado para os critérios informados"
				description="Revise a busca e os filtros, ou limpe os filtros para ver todos os seus pareceres."
				action={
					<Button type="button" variant="outline" onClick={onClearFilters}>
						Limpar Filtros
					</Button>
				}
			/>
		) : (
			<EmptyState
				title="Nenhum parecer emitido ainda"
				description="Os projetos que você aprovar ou reprovar aparecem aqui."
			/>
		);
	}

	return (
		<DataTable<MyReviewItem, MyReviewColumnId>
			columns={myReviewColumns}
			data={items}
			columnClassNames={columnClassNames}
			tableClassName="min-w-[70rem] lg:min-w-0"
			onRowClick={onOpen}
		/>
	);
};
