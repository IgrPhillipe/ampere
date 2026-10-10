import { createDataTableColumnHelper } from "@components/DataTable";
import { formatKva } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

import { AlertsCell } from "./AlertsCell";
import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineCell } from "./DeadlineCell";
import { DeadlineStatusBadge } from "./DeadlineStatusBadge";
import { QueueItemIndicator } from "./QueueItemIndicator";
import {
	formatQueueItemOrigin,
	formatReviewCycle,
	isUrgent,
} from "./review-queue-row";

const columnHelper = createDataTableColumnHelper<ReviewQueueItem>();

export type ReviewQueueColumnId =
	| "attention"
	| "protocol"
	| "name"
	| "status"
	| "deadline"
	| "cycle"
	| "units"
	| "demand"
	| "warnings"
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
		header: "Prazo",
		cell: ({ row }) => (
			<DeadlineStatusBadge deadlineStatus={row.original.deadlineStatus} />
		),
	}),
	columnHelper.accessor("deadline", {
		header: "Vencimento",
		cell: ({ row }) => <DeadlineCell item={row.original} />,
	}),
	columnHelper.accessor("reviewCycle", {
		id: "cycle",
		header: "Envio",
		cell: ({ row }) => (
			<span
				className={
					row.original.reviewCycle > 1
						? "text-sm whitespace-normal text-foreground"
						: "text-sm text-muted-foreground"
				}
			>
				{formatReviewCycle(row.original)}
			</span>
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
		header: "Alertas",
		cell: ({ row }) => <AlertsCell item={row.original} />,
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
