import { createDataTableColumnHelper } from "@components/DataTable";
import { formatKva } from "@features/shared";
import dayjs from "@lib/dayjs";
import { cn } from "@lib/utils";
import type { ReviewQueueItem } from "@services/review-queue";

import { AnalyzeButton } from "./AnalyzeButton";
import { DeadlineBadge, WarningBadge } from "./ReviewQueueBadges";

const columnHelper = createDataTableColumnHelper<ReviewQueueItem>();

export type ReviewQueueColumnId =
	| "protocol"
	| "name"
	| "units"
	| "demand"
	| "warnings"
	| "deadline"
	| "action";

const isUrgent = ({ deadlineStatus }: ReviewQueueItem) =>
	deadlineStatus !== "ON_TIME";

export const reviewQueueColumns = columnHelper.columns([
	columnHelper.accessor("protocol", {
		header: "Protocolo",
		cell: ({ row }) => (
			<span
				className={cn(
					"relative font-mono text-sm text-foreground",
					isUrgent(row.original) &&
						"before:absolute before:top-1/2 before:-left-4 before:h-7 before:w-0.5 before:-translate-y-1/2 before:bg-brand-sunset",
				)}
			>
				{row.original.protocol}
			</span>
		),
	}),
	columnHelper.accessor("name", {
		header: "Projeto",
		cell: ({ row }) => (
			<div className="flex min-w-0 flex-col gap-0.5 whitespace-normal">
				<span className="font-semibold text-foreground">
					{row.original.name}
				</span>
				<span className="truncate text-xs text-muted-foreground">
					{row.original.municipality}
					{row.original.applicantName ? ` · ${row.original.applicantName}` : ""}
					{row.original.reanalysis ? " · reanálise" : ""}
				</span>
			</div>
		),
	}),
	columnHelper.accessor("consumerUnitsCount", {
		id: "units",
		header: "UCs",
		cell: ({ row }) => (
			<span className="font-mono text-sm tabular-nums">
				{row.original.consumerUnitsCount}
			</span>
		),
	}),
	columnHelper.accessor("demandKva", {
		id: "demand",
		header: "Demanda",
		cell: ({ row }) =>
			row.original.demandKva === null ? (
				<span className="text-xs text-muted-foreground">Sem cálculo</span>
			) : (
				<span className="font-mono text-sm tabular-nums">
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
			<div className="flex flex-col items-start gap-1">
				<DeadlineBadge
					deadlineStatus={row.original.deadlineStatus}
					daysRemaining={row.original.daysRemaining}
				/>
				<time
					dateTime={row.original.deadline}
					className="font-mono text-[0.625rem] text-muted-foreground"
				>
					{dayjs(row.original.deadline).format("DD.MM.YYYY")}
				</time>
			</div>
		),
	}),
	columnHelper.display({
		id: "action",
		header: "",
		cell: () => <AnalyzeButton />,
	}),
]);
