import { createDataTableColumnHelper } from "@components/DataTable";
import { formatDate, formatKva } from "@features/shared";
import dayjs from "@lib/dayjs";
import type { Project } from "@services/projects";

import { PendingFindingsBadge } from "./PendingFindingsBadge";
import { ProjectActionIndicator } from "./ProjectActionIndicator";
import { ProjectRowActionButton } from "./ProjectRowActionButton";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import type { ProjectRowActions } from "./project-row";

const columnHelper = createDataTableColumnHelper<Project>();

/** Column ids, so `columnClassNames` does not accept a made-up key. */
export type ProjectColumnId =
	| "attention"
	| "protocol"
	| "name"
	| "status"
	| "pending"
	| "units"
	| "demand"
	| "createdAt"
	| "updatedAt"
	| "action";

export const createProjectColumns = (actions: ProjectRowActions) =>
	columnHelper.columns([
		columnHelper.display({
			id: "attention",
			header: () => <span className="sr-only">Pendência</span>,
			cell: ({ row }) => <ProjectActionIndicator project={row.original} />,
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
			// No `min-w`: the table is `table-fixed`, so the name wraps instead.
			cell: ({ row }) => (
				<span className="font-semibold whitespace-normal text-foreground">
					{row.original.name}
				</span>
			),
		}),
		columnHelper.accessor("status", {
			header: "Situação",
			cell: ({ row }) => <ProjectStatusBadge project={row.original} />,
		}),
		columnHelper.accessor("pendingCount", {
			id: "pending",
			header: "Pendências",
			cell: ({ row }) => (
				<PendingFindingsBadge count={row.original.pendingCount} />
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
		columnHelper.accessor("createdAt", {
			header: "Criado em",
			cell: ({ row }) => (
				<time
					dateTime={row.original.createdAt}
					className="font-mono text-xs text-foreground"
				>
					{formatDate(row.original.createdAt)}
				</time>
			),
		}),
		columnHelper.accessor("updatedAt", {
			header: "Atualizado",
			cell: ({ row }) => (
				<time
					dateTime={row.original.updatedAt}
					title={dayjs(row.original.updatedAt).format("DD/MM/YYYY HH:mm")}
					className="text-sm whitespace-normal text-muted-foreground"
				>
					{dayjs(row.original.updatedAt).fromNow()}
				</time>
			),
		}),
		columnHelper.display({
			id: "action",
			header: () => <span className="sr-only">Ação</span>,
			cell: ({ row }) => (
				<div className="flex justify-end">
					<ProjectRowActionButton
						project={row.original}
						{...actions}
						buttonClassName="w-full"
					/>
				</div>
			),
		}),
	]);
