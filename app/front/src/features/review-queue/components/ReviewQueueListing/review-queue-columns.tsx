import { CountBadge } from "@components/CountBadge";
import { createDataTableColumnHelper } from "@components/DataTable";
import { formatDate, formatKva } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineCell } from "./DeadlineCell";
import { QueueItemIndicator } from "./QueueItemIndicator";
import { ReviewQueueStatusSummary } from "./ReviewQueueStatusSummary";
import { formatQueueItemOrigin, isUrgent } from "./review-queue-row";

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
	| "deadline"
	| "action";

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
		cell: ({ row }) => (
			<CountBadge
				count={row.original.warnings}
				singular="Alerta"
				plural="Alertas"
				empty="Sem alertas"
				variant="warning"
			/>
		),
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
		cell: ({ row }) => <DeadlineCell item={row.original} />,
	}),
	columnHelper.display({
		id: "action",
		header: () => <span className="sr-only">Ação</span>,
		cell: ({ row }) => (
			<div className="flex justify-end">
				<AnalyzeButton
					urgent={isUrgent(row.original)}
					buttonClassName="w-full"
				/>
			</div>
		),
	}),
]);
