import { createDataTableColumnHelper } from "@components/DataTable";
import { DateCell } from "@components/DateCell";
import { formatKva, formatPlace } from "@features/shared";
import type { Project } from "@services/projects";

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
	| "owner"
	| "status"
	| "units"
	| "demand"
	| "createdAt"
	| "updatedAt"
	| "action";

interface ProjectColumnOptions {
	showOwner: boolean;
}

export const createProjectColumns = (
	actions: ProjectRowActions,
	{ showOwner }: ProjectColumnOptions,
) =>
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
				<div className="flex flex-col gap-1 whitespace-normal">
					<span className="text-base font-medium text-foreground">
						{row.original.name}
					</span>
					<span className="text-sm text-muted-foreground">
						{row.original.address},{" "}
						{formatPlace(row.original.municipality, row.original.state)}
					</span>
				</div>
			),
		}),
		...(showOwner
			? [
					columnHelper.accessor("ownerName", {
						id: "owner",
						header: "Projetista",
						cell: ({ row }) => (
							<span className="text-sm whitespace-normal text-muted-foreground">
								{row.original.ownerName ?? "Não informado"}
							</span>
						),
					}),
				]
			: []),
		columnHelper.accessor("status", {
			header: "Situação",
			// The open findings ride on the status, as in the Figma.
			cell: ({ row }) => (
				<ProjectStatusBadge project={row.original} showPending />
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
			cell: ({ row }) => <DateCell value={row.original.createdAt} />,
		}),
		columnHelper.accessor("updatedAt", {
			header: "Atualizado",
			cell: ({ row }) => <DateCell value={row.original.updatedAt} />,
		}),
		columnHelper.display({
			id: "action",
			header: () => <span className="sr-only">Ação</span>,
			cell: ({ row }) => (
				<ProjectRowActionButton project={row.original} {...actions} />
			),
		}),
	]);
