import { DataTable } from "@components/DataTable";
import { EmptyState } from "@components/EmptyState";
import type { ReviewerDistribution } from "@services/reviewer-distribution";
import { useMemo } from "react";

import {
	createReviewerDistributionColumns,
	type ReviewerDistributionColumnId,
	type ReviewerDistributionRowActions,
} from "./reviewer-distribution-columns";

const columnClassNames = {
	reviewer: "w-56",
	count: "w-20 text-right",
	action: "w-40 pr-0 text-right",
} satisfies Partial<Record<ReviewerDistributionColumnId, string>>;

interface ReviewerDistributionTableProps
	extends ReviewerDistributionRowActions {
	items: ReviewerDistribution[];
	isLoading?: boolean;
	className?: string;
}

export const ReviewerDistributionTable = ({
	items,
	isLoading = false,
	onEdit,
	className,
}: ReviewerDistributionTableProps) => {
	const columns = useMemo(
		() => createReviewerDistributionColumns({ onEdit }),
		[onEdit],
	);

	return (
		<DataTable<ReviewerDistribution, ReviewerDistributionColumnId>
			columns={columns}
			data={items}
			isLoading={isLoading}
			columnClassNames={columnClassNames}
			tableClassName="min-w-[44rem]"
			className={className}
			empty={
				<EmptyState
					title="Nenhum analista ativo"
					description="Cadastre ou reative analistas em Usuários para distribuir os municípios."
				/>
			}
		/>
	);
};
