import { createDataTableColumnHelper } from "@components/DataTable";
import { DateCell } from "@components/DateCell";
import { formatDate, formatKva } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

import { AlertsCell } from "./AlertsCell";
import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineCell } from "./DeadlineCell";
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
	| "units"
	| "demand"
	| "warnings"
	| "deadline"
	| "status"
	| "action"
	// No column of its own, but still a sort key of the list.
	| "submittedAt";

export interface ReviewQueueRowActions {
	onAnalyze: (item: ReviewQueueItem) => void;
}

/** The H06 set: receipt and submission cycle ride on the project's second line. */
export const createReviewQueueColumns = ({
	onAnalyze,
}: ReviewQueueRowActions) =>
	columnHelper.columns([
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
					<span className="text-base font-medium text-foreground">
						{row.original.name}
					</span>
					<span className="text-sm text-muted-foreground">
						<span>{formatQueueItemOrigin(row.original)}</span>
						{row.original.reviewCycle > 1 ? (
							<>
								, <span>{formatReviewCycle(row.original)}</span>
							</>
						) : null}
						, recebido em{" "}
						<time dateTime={row.original.submittedAt} className="font-mono">
							{formatDate(row.original.submittedAt)}
						</time>
					</span>
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
			cell: ({ row }) => <AlertsCell item={row.original} />,
		}),
		columnHelper.accessor("deadline", {
			header: "Vencimento",
			cell: ({ row }) => <DateCell value={row.original.deadline} />,
		}),
		columnHelper.accessor("deadlineStatus", {
			id: "status",
			header: "Prazo",
			cell: ({ row }) => <DeadlineCell item={row.original} />,
		}),
		columnHelper.display({
			id: "action",
			header: () => <span className="sr-only">Ação</span>,
			cell: ({ row }) => (
				<AnalyzeButton
					urgent={isUrgent(row.original)}
					onAnalyze={() => onAnalyze(row.original)}
				/>
			),
		}),
	]);
