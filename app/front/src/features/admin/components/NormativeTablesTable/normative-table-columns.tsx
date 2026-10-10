import { createDataTableColumnHelper } from "@components/DataTable";
import { RowAction } from "@components/RowAction";
import type { NormativeTable } from "@services/normative-tables";

import { NormativeTableStatusBadge } from "../NormativeTableStatusBadge";
import { getNormativeTableAction } from "./normative-table-row";
import { PersonCell } from "./PersonCell";

const columnHelper = createDataTableColumnHelper<NormativeTable>();

export type NormativeTableColumnId =
	| "identification"
	| "standard"
	| "item"
	| "rowCount"
	| "status"
	| "registeredBy"
	| "verifiedBy"
	| "action";

export const createNormativeTableColumns = (
	onOpen: (table: NormativeTable) => void,
	email: string | undefined,
) =>
	columnHelper.columns([
		columnHelper.accessor("identification", {
			header: "Tabela",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1 whitespace-normal">
					<span className="font-semibold text-foreground">
						{row.original.identification}
					</span>
					<span className="text-xs text-muted-foreground">
						{row.original.title}
					</span>
				</div>
			),
		}),
		columnHelper.accessor("standard", {
			header: "Norma",
			cell: ({ row }) => (
				<span className="font-mono text-xs whitespace-normal text-foreground">
					{row.original.standard.name} {row.original.standard.revision}
				</span>
			),
		}),
		columnHelper.accessor("item", {
			header: "Item e página",
			cell: ({ row }) => (
				<span className="font-mono text-xs whitespace-normal text-foreground">
					{row.original.item}, p. {row.original.page}
				</span>
			),
		}),
		columnHelper.accessor("rowCount", {
			header: "Linhas",
			cell: ({ row }) => (
				<span className="font-mono text-xs text-foreground">
					{row.original.rowCount}
				</span>
			),
		}),
		columnHelper.accessor("status", {
			header: "Situação",
			cell: ({ row }) => (
				<NormativeTableStatusBadge status={row.original.status} />
			),
		}),
		columnHelper.accessor("registeredBy", {
			header: "Cadastro",
			cell: ({ row }) => (
				<PersonCell
					person={row.original.registeredBy}
					at={row.original.registeredAt}
				/>
			),
		}),
		columnHelper.accessor("verifiedBy", {
			header: "Revisão",
			cell: ({ row }) =>
				row.original.verifiedBy ? (
					<PersonCell
						person={row.original.verifiedBy}
						at={row.original.verifiedAt}
					/>
				) : (
					<span className="text-sm text-muted-foreground">Pendente</span>
				),
		}),
		columnHelper.display({
			id: "action",
			header: () => <span className="sr-only">Ação</span>,
			cell: ({ row }) => {
				const action = getNormativeTableAction(row.original, email);

				return (
					<div className="flex justify-end">
						<RowAction
							label={action.label}
							required={action.required}
							buttonClassName="w-full"
							onClick={(event) => {
								// The row opens the sheet too; one open per click is enough.
								event.stopPropagation();
								onOpen(row.original);
							}}
						/>
					</div>
				);
			},
		}),
	]);
