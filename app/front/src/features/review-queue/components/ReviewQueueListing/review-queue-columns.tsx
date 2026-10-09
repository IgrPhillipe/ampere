import { createDataTableColumnHelper } from "@components/DataTable";
import { formatDate, formatKva } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

import { QueueItemIndicator } from "./QueueItemIndicator";
import { ReviewQueueStatusSummary } from "./ReviewQueueStatusSummary";
import { formatQueueItemOrigin } from "./review-queue-row";
import { WarningsBadge } from "./WarningsBadge";

const columnHelper = createDataTableColumnHelper<ReviewQueueItem>();

export type ReviewQueueColumnId =
	| "attention"
	| "protocol"
	| "name"
	| "status"
	| "units"
	| "demand"
	| "warnings"
	| "submittedAt"
	| "deadline";

export const reviewQueueColumns = columnHelper.columns([
	columnHelper.display({
		id: "attention",
		header: () => <span className="sr-only">Atenção</span>,
		cell: ({ row }) => <QueueItemIndicator item={row.original} />,
	}),
	columnHelper.accessor("protocol", {
		header: "Protocolo",
		cell: ({ row }) => (
			<span className="font-mono text-sm text-foreground">
				{row.original.protocol}
			</span>
		),
	}),
	columnHelper.accessor("name", {
		header: "Projeto",
		cell: ({ row }) => (
			<div className="flex flex-col gap-1 whitespace-normal">
				<span className="font-semibold text-foreground">
					{row.original.name}
				</span>
				<span className="text-xs text-muted-foreground">
					{formatQueueItemOrigin(row.original)}
				</span>
			</div>
		),
	}),
	columnHelper.accessor("deadlineStatus", {
		id: "status",
		header: "Situação",
		cell: ({ row }) => (
			<div className="whitespace-normal">
				<ReviewQueueStatusSummary item={row.original} />
			</div>
		),
	}),
	columnHelper.accessor("consumerUnitsCount", {
		id: "units",
		header: "UCs",
		cell: ({ row }) => (
			<span className="font-mono text-sm text-foreground">
				{row.original.consumerUnitsCount}
			</span>
		),
	}),
	columnHelper.accessor("demandKva", {
		id: "demand",
		header: "Demanda",
		cell: ({ row }) =>
			row.original.demandKva === null ? (
				<span className="text-sm text-muted-foreground">Sem cálculo</span>
			) : (
				<span className="font-mono text-sm whitespace-nowrap text-foreground">
					{formatKva(row.original.demandKva, 1)}
				</span>
			),
	}),
	columnHelper.accessor("warnings", {
		header: "Pré-validação",
		cell: ({ row }) => <WarningsBadge warnings={row.original.warnings} />,
	}),
	columnHelper.accessor("submittedAt", {
		header: "Enviado em",
		cell: ({ row }) => (
			<time
				dateTime={row.original.submittedAt}
				className="font-mono text-xs text-foreground"
			>
				{formatDate(row.original.submittedAt)}
			</time>
		),
	}),
	columnHelper.accessor("deadline", {
		header: "Prazo",
		cell: ({ row }) => (
			<time
				dateTime={row.original.deadline}
				className="font-mono text-xs text-foreground"
			>
				{formatDate(row.original.deadline)}
			</time>
		),
	}),
]);
