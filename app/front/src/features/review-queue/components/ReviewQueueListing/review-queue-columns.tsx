import { createDataTableColumnHelper } from "@components/DataTable";
import { DateCell } from "@components/DateCell";
import { Badge } from "@components/ui/badge";
import { formatDate, formatKva } from "@features/shared";
import type {
	ReviewQueueItem,
	ReviewQueueStatus,
} from "@services/review-queue";

import { AlertsCell } from "./AlertsCell";
import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineCell } from "./DeadlineCell";
import { QueueItemIndicator } from "./QueueItemIndicator";
import {
	formatQueueItemOrigin,
	formatReviewCycle,
	isResponsible,
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
	| "decision"
	| "reviewedAt"
	| "action"
	// No column of its own, but still a sort key of the list.
	| "submittedAt";

export interface ReviewQueueRowActions {
	/** Opens the project: to review it when the user holds it, to consult it otherwise. */
	onAnalyze: (item: ReviewQueueItem) => void;
}

interface ReviewQueueColumnOptions extends ReviewQueueRowActions {
	/** Only the analyst responsible for a project reviews it. */
	currentUserId?: string;
	/** Approved or rejected projects: the decision replaces the deadline columns. */
	decided?: boolean;
}

const decisionLabels: Record<ReviewQueueStatus, string> = {
	UNDER_REVIEW: "Em análise",
	APPROVED: "Aprovado",
	REJECTED: "Reprovado",
	EXPIRED: "Aprovação vencida",
};

/** What every row shows, decided or not: receipt and submission cycle ride on the second line. */
const commonColumns = () =>
	[
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
	] as const;

/** The H06 set for the projects under review; the decided ones swap the deadline for the decision. */
export const createReviewQueueColumns = ({
	onAnalyze,
	currentUserId,
	decided = false,
}: ReviewQueueColumnOptions) =>
	decided
		? columnHelper.columns([
				...commonColumns(),
				columnHelper.accessor("status", {
					id: "decision",
					header: "Decisão",
					cell: ({ row }) => (
						<Badge variant="outline">
							{decisionLabels[row.original.status]}
						</Badge>
					),
				}),
				columnHelper.accessor("reviewedAt", {
					header: "Decidido em",
					cell: ({ row }) =>
						row.original.reviewedAt ? (
							<DateCell value={row.original.reviewedAt} />
						) : null,
				}),
				columnHelper.display({
					id: "action",
					header: () => <span className="sr-only">Ação</span>,
					cell: ({ row }) => (
						<AnalyzeButton
							urgent={false}
							consult
							onAnalyze={() => onAnalyze(row.original)}
						/>
					),
				}),
			])
		: columnHelper.columns([
				...commonColumns(),
				columnHelper.accessor("warnings", {
					header: "Pré-validação",
					cell: ({ row }) => <AlertsCell item={row.original} />,
				}),
				columnHelper.accessor("deadline", {
					header: "Vencimento",
					cell: ({ row }) =>
						row.original.deadline ? (
							<DateCell value={row.original.deadline} />
						) : null,
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
							consult={!isResponsible(row.original, currentUserId)}
							onAnalyze={() => onAnalyze(row.original)}
						/>
					),
				}),
			]);
