import { createDataTableColumnHelper } from "@components/DataTable";
import { DateCell } from "@components/DateCell";
import { formatVersion } from "@features/projects";
import { formatKva, padCount } from "@features/shared";
import type { MyReviewItem } from "@services/review-queue";
import { Link } from "@tanstack/react-router";

import { myReviewDecisionLabels } from "../../constants";

const columnHelper = createDataTableColumnHelper<MyReviewItem>();

export type MyReviewColumnId =
	| "protocol"
	| "name"
	| "units"
	| "demand"
	| "version"
	| "findings"
	| "decision"
	| "decidedAt";

const mono = "font-mono text-sm text-foreground";

/** H13: no action column. The name is the link, and the row opens the same analysis. */
export const myReviewColumns = columnHelper.columns([
	columnHelper.accessor("protocol", {
		header: "Protocolo",
		cell: ({ row }) => <span className={mono}>{row.original.protocol}</span>,
	}),
	columnHelper.accessor("name", {
		header: "Projeto",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1 whitespace-normal">
				<Link
					to="/projetos/$id"
					params={{ id: row.original.id }}
					// The row opens the same page; one navigation is enough.
					onClick={(event) => event.stopPropagation()}
					className="text-base font-medium text-foreground hover:underline focus-visible:underline focus-visible:outline-none"
				>
					{row.original.name}
				</Link>
				<span className="text-sm text-muted-foreground">
					{row.original.ownerName
						? `${row.original.ownerName}, ${row.original.municipality}/${row.original.state}`
						: `${row.original.municipality}/${row.original.state}`}
				</span>
			</div>
		),
	}),
	columnHelper.accessor("consumerUnitsCount", {
		id: "units",
		header: "UCs",
		cell: ({ row }) => (
			<span className={mono}>{row.original.consumerUnitsCount}</span>
		),
	}),
	columnHelper.accessor("demandKva", {
		id: "demand",
		header: "Demanda",
		cell: ({ row }) =>
			row.original.demandKva === null ? (
				<span className="text-sm text-muted-foreground">Sem cálculo</span>
			) : (
				<span className={`${mono} whitespace-nowrap`}>
					{formatKva(row.original.demandKva, 1)}
				</span>
			),
	}),
	columnHelper.accessor("version", {
		header: "Versão",
		cell: ({ row }) => (
			<span className={mono}>{formatVersion(row.original.version)}</span>
		),
	}),
	columnHelper.accessor("findings", {
		header: "Apontamentos",
		cell: ({ row }) => (
			<span className={mono}>{padCount(row.original.findings)}</span>
		),
	}),
	columnHelper.accessor("decision", {
		header: "Decisão",
		cell: ({ row }) => (
			<span className="font-mono text-2xs tracking-[0.11em] text-foreground uppercase">
				{myReviewDecisionLabels[row.original.decision]}
			</span>
		),
	}),
	columnHelper.accessor("decidedAt", {
		header: "Data",
		cell: ({ row }) => <DateCell value={row.original.decidedAt} />,
	}),
]);
