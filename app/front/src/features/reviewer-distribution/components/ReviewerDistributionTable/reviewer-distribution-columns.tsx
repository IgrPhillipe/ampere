import { createDataTableColumnHelper } from "@components/DataTable";
import { RowAction } from "@components/RowAction";
import { formatPlace } from "@features/shared";
import type { ReviewerDistribution } from "@services/reviewer-distribution";

import { sortMunicipalities } from "../../constants";

const columnHelper = createDataTableColumnHelper<ReviewerDistribution>();

export type ReviewerDistributionColumnId =
	| "reviewer"
	| "municipalities"
	| "count"
	| "action";

export interface ReviewerDistributionRowActions {
	onEdit: (item: ReviewerDistribution) => void;
}

export const createReviewerDistributionColumns = ({
	onEdit,
}: ReviewerDistributionRowActions) =>
	columnHelper.columns([
		columnHelper.accessor((item) => item.reviewer.name, {
			id: "reviewer",
			header: "Analista",
			cell: ({ row }) => (
				<span className="text-base font-medium text-foreground">
					{row.original.reviewer.name}
				</span>
			),
		}),
		columnHelper.display({
			id: "municipalities",
			header: "Municípios",
			cell: ({ row }) =>
				row.original.municipalities.length === 0 ? (
					<span className="text-sm text-muted-foreground">
						Nenhum município
					</span>
				) : (
					<span className="text-sm whitespace-normal text-foreground">
						{sortMunicipalities(row.original.municipalities)
							.map(({ municipality, state }) =>
								formatPlace(municipality, state),
							)
							.join("; ")}
					</span>
				),
		}),
		columnHelper.display({
			id: "count",
			header: "Total",
			cell: ({ row }) => (
				<span className="font-mono text-sm text-foreground">
					{row.original.municipalities.length}
				</span>
			),
		}),
		columnHelper.display({
			id: "action",
			header: () => <span className="sr-only">Ação</span>,
			cell: ({ row }) => (
				<RowAction
					label="Editar Municípios"
					required={false}
					aria-label={`Editar municípios de ${row.original.reviewer.name}`}
					onClick={() => onEdit(row.original)}
				/>
			),
		}),
	]);
