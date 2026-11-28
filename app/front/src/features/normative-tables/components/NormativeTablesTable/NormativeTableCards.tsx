import { cn } from "@lib/utils";
import type { NormativeTableListing } from "@services/normative-tables";

import { NormativeTableStatusBadge } from "../NormativeTableStatusBadge";
import { PendingRevisionBadge } from "./PendingRevisionBadge";
import { TableIdentity } from "./TableIdentity";

interface NormativeTableCardsProps {
	tables: NormativeTableListing[];
	onOpen: (table: NormativeTableListing) => void;
	className?: string;
}

export const NormativeTableCards = ({
	tables,
	onOpen,
	className,
}: NormativeTableCardsProps) => (
	<ul className={cn("flex flex-col bg-card", className)}>
		{tables.map((table) => (
			<li key={table.id} className="border-b border-border last:border-b-0">
				<button
					type="button"
					onClick={() => onOpen(table)}
					className="flex w-full flex-col gap-3 px-6 py-4 text-left transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
				>
					<div className="flex w-full items-start justify-between gap-3">
						<TableIdentity table={table} />

						<div className="flex shrink-0 flex-col items-end gap-1.5">
							<NormativeTableStatusBadge status={table.status} />
							{table.pendingRevision ? <PendingRevisionBadge /> : null}
						</div>
					</div>

					<span className="font-mono text-xs text-muted-foreground">
						{table.standard.name} {table.standard.revision}, {table.item}, p.{" "}
						{table.page}
					</span>

					<dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
						<div className="flex gap-1.5">
							<dt>Linhas</dt>
							<dd className="font-mono">{table.rowCount}</dd>
						</div>

						<div className="flex gap-1.5">
							<dt>Cadastro</dt>
							<dd>{table.registeredByName}</dd>
						</div>

						<div className="flex gap-1.5">
							<dt>Aprovação</dt>
							<dd>{table.verifiedByName ?? "Pendente"}</dd>
						</div>
					</dl>
				</button>
			</li>
		))}
	</ul>
);
