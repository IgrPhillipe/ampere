import { createDataTableColumnHelper } from "@components/DataTable";
import type { NormativeTable } from "@services/normative-tables";

import { NormativeTableStatusBadge } from "../NormativeTableStatusBadge";
import { PersonCell } from "./PersonCell";

const columnHelper = createDataTableColumnHelper<NormativeTable>();

export type NormativeTableColumnId =
	| "identification"
	| "standard"
	| "item"
	| "rowCount"
	| "status"
	| "registeredBy"
	| "verifiedBy";

export const createNormativeTableColumns = (
	onOpen: (table: NormativeTable) => void,
) =>
	columnHelper.columns([
		columnHelper.accessor("identification", {
			header: "Tabela",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1 whitespace-normal">
					<button
						type="button"
						onClick={(event) => {
							// The row opens the sheet too; one open per click is enough.
							event.stopPropagation();
							onOpen(row.original);
						}}
						className="self-start text-left font-semibold text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						{row.original.identification}
					</button>
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
	]);
