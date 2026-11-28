import { AttentionIndicator } from "@components/AttentionIndicator";
import { createDataTableColumnHelper } from "@components/DataTable";
import { RowAction } from "@components/RowAction";
import type {
	NormativeTable,
	NormativeTableListing,
} from "@services/normative-tables";

import { NormativeTableStatusBadge } from "../NormativeTableStatusBadge";
import {
	getNormativeTableAction,
	getNormativeTableAttention,
	getNormativeTableTarget,
} from "./normative-table-row";
import { PendingRevisionBadge } from "./PendingRevisionBadge";
import { PersonCell } from "./PersonCell";
import { TableIdentity } from "./TableIdentity";

const columnHelper = createDataTableColumnHelper<NormativeTableListing>();

export type NormativeTableColumnId =
	| "attention"
	| "code"
	| "standard"
	| "item"
	| "rowCount"
	| "status"
	| "registeredAt"
	| "verifiedAt"
	| "action";

export const createNormativeTableColumns = (
	onOpen: (table: NormativeTable) => void,
	email: string | undefined,
	canReview: boolean,
) =>
	columnHelper.columns([
		columnHelper.display({
			id: "attention",
			header: () => <span className="sr-only">Atenção</span>,
			cell: ({ row }) => {
				const message = getNormativeTableAttention(
					row.original,
					email,
					canReview,
				);

				return message ? <AttentionIndicator message={message} /> : null;
			},
		}),
		columnHelper.accessor("identification", {
			id: "code",
			header: "Tabela",
			cell: ({ row }) => <TableIdentity table={row.original} />,
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
				<span className="font-mono text-sm text-foreground">
					{row.original.rowCount}
				</span>
			),
		}),
		columnHelper.accessor("status", {
			header: "Situação",
			cell: ({ row }) => (
				<div className="flex flex-col items-start gap-1.5">
					<NormativeTableStatusBadge status={row.original.status} />
					{row.original.pendingRevision ? <PendingRevisionBadge /> : null}
				</div>
			),
		}),
		columnHelper.accessor("registeredByName", {
			id: "registeredAt",
			header: "Cadastro",
			cell: ({ row }) => (
				<PersonCell
					person={row.original.registeredByName}
					at={row.original.registeredAt}
				/>
			),
		}),
		columnHelper.accessor("verifiedByName", {
			id: "verifiedAt",
			header: "Aprovação",
			cell: ({ row }) =>
				row.original.verifiedByName ? (
					<PersonCell
						person={row.original.verifiedByName}
						at={row.original.verifiedAt}
					/>
				) : (
					<span className="text-sm text-faint-foreground">Pendente</span>
				),
		}),
		columnHelper.display({
			id: "action",
			header: () => <span className="sr-only">Ação</span>,
			cell: ({ row }) => {
				const action = getNormativeTableAction(row.original, email);

				return (
					<RowAction
						label={action.label}
						required={action.required}
						onClick={(event) => {
							// The row opens the sheet too; one open per click is enough.
							event.stopPropagation();
							onOpen(getNormativeTableTarget(row.original));
						}}
					/>
				);
			},
		}),
	]);
