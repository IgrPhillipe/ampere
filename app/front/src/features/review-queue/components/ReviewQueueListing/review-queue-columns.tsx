import { createDataTableColumnHelper } from "@components/DataTable";
import { DateCell } from "@components/DateCell";
import { Checkbox } from "@components/ui/checkbox";
import { formatDate, formatKva } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

import { AlertsCell } from "./AlertsCell";
import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineCell } from "./DeadlineCell";
import { QueueItemIndicator } from "./QueueItemIndicator";
import { ReviewerCell } from "./ReviewerCell";
import {
	formatQueueItemOrigin,
	formatReviewCycle,
	isResponsible,
	isUrgent,
} from "./review-queue-row";

const columnHelper = createDataTableColumnHelper<ReviewQueueItem>();

export type ReviewQueueColumnId =
	| "select"
	| "attention"
	| "protocol"
	| "name"
	| "units"
	| "demand"
	| "warnings"
	| "deadline"
	| "status"
	| "reviewer"
	| "action"
	// No column of its own, but still a sort key of the list.
	| "submittedAt";

export interface ReviewQueueRowActions {
	/** Opens the project: to review it when the user holds it, to consult it otherwise. */
	onAnalyze: (item: ReviewQueueItem) => void;
}

/** Row selection of the batch assignment, offered to the manager only. */
export interface ReviewQueueSelection {
	selectedIds: readonly string[];
	onSelectedIdsChange: (ids: string[]) => void;
}

interface ReviewQueueColumnOptions extends ReviewQueueRowActions {
	/** Only the analyst responsible for a project reviews it. */
	currentUserId?: string;
	selection?: ReviewQueueSelection;
	/** The ids on the page, which the header checkbox selects at once. */
	pageIds?: readonly string[];
}

const selectColumn = (
	{ selectedIds, onSelectedIdsChange }: ReviewQueueSelection,
	pageIds: readonly string[],
) =>
	columnHelper.display({
		id: "select",
		header: () => {
			const selectedOnPage = pageIds.filter((id) => selectedIds.includes(id));
			const all =
				pageIds.length > 0 && selectedOnPage.length === pageIds.length;

			return (
				<Checkbox
					aria-label="Selecionar todos os projetos da página"
					checked={all}
					indeterminate={selectedOnPage.length > 0 && !all}
					onCheckedChange={(checked) =>
						onSelectedIdsChange(
							checked
								? [...new Set([...selectedIds, ...pageIds])]
								: selectedIds.filter((id) => !pageIds.includes(id)),
						)
					}
				/>
			);
		},
		cell: ({ row }) => {
			const { id, protocol } = row.original;

			return (
				<Checkbox
					aria-label={`Selecionar o projeto ${protocol}`}
					checked={selectedIds.includes(id)}
					onCheckedChange={(checked) =>
						onSelectedIdsChange(
							checked
								? [...selectedIds, id]
								: selectedIds.filter((selected) => selected !== id),
						)
					}
				/>
			);
		},
	});

/** The H06 set: receipt and submission cycle ride on the project's second line. */
export const createReviewQueueColumns = ({
	onAnalyze,
	currentUserId,
	selection,
	pageIds = [],
}: ReviewQueueColumnOptions) =>
	columnHelper.columns([
		...(selection ? [selectColumn(selection, pageIds)] : []),
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
		columnHelper.accessor("reviewerName", {
			id: "reviewer",
			header: "Analista Responsável",
			cell: ({ row }) => <ReviewerCell item={row.original} />,
		}),
		columnHelper.display({
			id: "action",
			header: () => <span className="sr-only">Ação</span>,
			cell: ({ row }) => (
				<AnalyzeButton
					urgent={isUrgent(row.original)}
					consult={!isResponsible(row.original, currentUserId)}
					onAnalyze={() => onAnalyze(row.original)}
				/>
			),
		}),
	]);
