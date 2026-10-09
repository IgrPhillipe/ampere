import { createDataTableColumnHelper } from "@components/DataTable";
import { formatKva } from "@features/shared";
import type { ReviewQueueItem } from "@services/review-queue";

import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineIndicator } from "./DeadlineIndicator";
import {
	DeadlineBadge,
	ReanalysisBadge,
	WarningBadge,
} from "./ReviewQueueBadges";
import { formatQueueItemOrigin } from "./review-queue-row";

const columnHelper = createDataTableColumnHelper<ReviewQueueItem>();

export type ReviewQueueColumnId =
	| "attention"
	| "protocol"
	| "name"
	| "units"
	| "demand"
	| "warnings"
	| "deadline"
	| "action";

export const reviewQueueColumns = columnHelper.columns([
	columnHelper.display({
		id: "attention",
		header: () => <span className="sr-only">Prioridade</span>,
		cell: ({ row }) => (
			<DeadlineIndicator deadlineStatus={row.original.deadlineStatus} />
		),
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
				<span className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
					{row.original.name}
					{row.original.reanalysis ? <ReanalysisBadge /> : null}
				</span>
				<span className="text-xs text-muted-foreground">
					{formatQueueItemOrigin(row.original)}
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
		cell: ({ row }) => <WarningBadge warnings={row.original.warnings} />,
	}),
	columnHelper.accessor("deadline", {
		header: "Prazo",
		cell: ({ row }) => (
			<DeadlineBadge
				deadlineStatus={row.original.deadlineStatus}
				daysRemaining={row.original.daysRemaining}
			/>
		),
	}),
	columnHelper.display({
		id: "action",
		header: () => <span className="sr-only">Ação</span>,
		cell: () => <AnalyzeButton />,
	}),
]);
